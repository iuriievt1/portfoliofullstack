import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { validate } from "../middlewares/validate.js";
import { User } from "../models/user.model.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { config } from "../config.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8),
    name: z.string().min(1).max(120).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  })
});

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function refreshExpiresAt() {
  const days = config.jwt.refreshTtlDays;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function setAccessCookie(res, token) {
  res.cookie("access", token, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    path: "/",
    maxAge: config.jwt.accessTtlMin * 60 * 1000
  });
}

router.post("/register", validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.validated.body;

  const exists = await User.findOne({ email }).lean();
  if (exists) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, name: name || "" });

  res.json({ user: { id: user._id.toString(), email: user.email, name: user.name } });
}));

router.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
  const refreshToken = signRefreshToken({ sub: user._id.toString(), type: "refresh" });
  const tokenHash = sha256(refreshToken);

  // Rotate by keeping only last 5 tokens
  const expiresAt = refreshExpiresAt();
  user.refreshTokens = [{ tokenHash, expiresAt }, ...user.refreshTokens].slice(0, 5);
  await user.save();

  setAccessCookie(res, accessToken);

  res.cookie("refresh", refreshToken, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    path: "/api/auth/refresh",
    maxAge: config.jwt.refreshTtlDays * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken, user: { id: user._id.toString(), email: user.email, name: user.name } });
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const token = req.cookies.refresh;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = payload.sub;
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const tokenHash = sha256(token);

  // Remove expired tokens
  user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > new Date());

  const has = user.refreshTokens.some((t) => t.tokenHash === tokenHash);
  if (!has) return res.status(401).json({ error: "Unauthorized" });

  // Rotate refresh token
  const newRefresh = signRefreshToken({ sub: user._id.toString(), type: "refresh" });
  const newHash = sha256(newRefresh);

  user.refreshTokens = [
    { tokenHash: newHash, expiresAt: refreshExpiresAt() },
    ...user.refreshTokens.filter((t) => t.tokenHash !== tokenHash)
  ].slice(0, 5);

  await user.save();

  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });

  setAccessCookie(res, accessToken);

  res.cookie("refresh", newRefresh, {
    httpOnly: true,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    path: "/api/auth/refresh",
    maxAge: config.jwt.refreshTtlDays * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken });
}));

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: { id: user._id.toString(), email: user.email, name: user.name } });
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const token = req.cookies.refresh;
  res.clearCookie("refresh", { path: "/api/auth/refresh" });
  res.clearCookie("access", { path: "/" });

  if (!token) return res.json({ ok: true });

  let payload;
  try { payload = verifyRefreshToken(token); } catch { return res.json({ ok: true }); }

  const user = await User.findById(payload.sub);
  if (!user) return res.json({ ok: true });

  const tokenHash = sha256(token);
  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
  await user.save();

  res.json({ ok: true });
}));

export default router;
