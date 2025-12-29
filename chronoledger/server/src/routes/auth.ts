import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { sha256 } from "../lib/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { clearRefreshCookie, REFRESH_COOKIE, setRefreshCookie } from "../lib/cookies.js";
import { requireAuth } from "../middlewares/auth.js";
import { config } from "../config.js";

const r = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional()
});

r.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return next(Object.assign(new Error("Email already in use"), { status: 409 }));

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email, passwordHash, name: body.name ?? null },
      select: { id: true, email: true, name: true }
    });

    res.json({ user });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

r.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return next(Object.assign(new Error("Invalid credentials"), { status: 401 }));

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return next(Object.assign(new Error("Invalid credentials"), { status: 401 }));

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email });

    const tokenHash = sha256(refreshToken);
    const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: { userId: user.id, tokenHash, expiresAt }
    });

    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (e) {
    next(e);
  }
});

r.post("/refresh", async (req, res, next) => {
  try {
    const token = String(req.cookies?.[REFRESH_COOKIE] || "");
    if (!token) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

    const payload = verifyRefreshToken(token);
    if (payload?.kind !== "refresh") return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

    const tokenHash = sha256(token);

    const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!row || row.revokedAt || row.expiresAt.getTime() < Date.now()) {
      clearRefreshCookie(res);
      return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
    }

    // rotate: revoke old and issue new
    await prisma.refreshToken.update({ where: { tokenHash }, data: { revokedAt: new Date() } });

    const userId = String(payload.sub);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

    const newAccess = signAccessToken({ id: user.id, email: user.email });
    const newRefresh = signRefreshToken({ id: user.id, email: user.email });
    const newHash = sha256(newRefresh);
    const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: newHash, expiresAt } });
    setRefreshCookie(res, newRefresh);

    res.json({ accessToken: newAccess });
  } catch (e) {
    next(e);
  }
});

r.post("/logout", async (req, res, next) => {
  try {
    const token = String(req.cookies?.[REFRESH_COOKIE] || "");
    if (token) {
      const tokenHash = sha256(token);
      await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revokedAt: new Date() } });
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

r.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default r;
