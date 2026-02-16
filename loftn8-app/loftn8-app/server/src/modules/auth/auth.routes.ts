import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { validate } from "../../middleware/validate";

export const authRouter = Router();

const RequestOtpSchema = z.object({
  phone: z.string().min(6),
});

const VerifyOtpSchema = z.object({
  phone: z.string().min(6),
  code: z.string().min(4),
  name: z.string().min(1),
  email: z.string().email(), // обязательно для базы/рассылок
});

function setCookie(res: any, name: string, value: string, maxAgeSeconds: number) {
  res.cookie(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: maxAgeSeconds * 1000,
    path: "/",
  });
}

function clearCookie(res: any, name: string) {
  res.clearCookie(name, {
    domain: env.COOKIE_DOMAIN || undefined,
    path: "/",
  });
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

function genOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Guest OTP: request code
authRouter.post(
  "/guest/request-otp",
  validate(RequestOtpSchema),
  asyncHandler(async (req, res) => {
    const phone = normalizePhone((req.body as any).phone);

    const code = genOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: { phone, codeHash, expiresAt },
    });

    // V1 пилот: возвращаем код только в development, чтобы тестировать без SMS провайдера
    // В production здесь будет отправка SMS/WhatsApp провайдером, а code не возвращаем.
    if (env.NODE_ENV === "development") {
      return res.json({ ok: true, devOtp: code, expiresInSec: 600 });
    }

    return res.json({ ok: true });
  })
);

// Guest OTP: verify -> create/upsert user + set uid cookie + link to guestSession if exists
authRouter.post(
  "/guest/verify-otp",
  validate(VerifyOtpSchema),
  asyncHandler(async (req, res) => {
    const { phone: rawPhone, code, name, email } = req.body as any;
    const phone = normalizePhone(rawPhone);

    const otp = await prisma.otpCode.findFirst({
      where: {
        phone,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) throw new HttpError(400, "OTP_NOT_FOUND", "OTP code not found or expired");

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) throw new HttpError(400, "OTP_INVALID", "OTP code is invalid");

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    const user = await prisma.user.upsert({
      where: { phone },
      update: { name, email },
      create: { phone, name, email },
    });

    const uidToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_USER_SECRET, { expiresIn: "30d" });
    setCookie(res, "uid", uidToken, 60 * 60 * 24 * 30);

    // Если есть гостевая сессия - привяжем userId
    const gsid = (req.cookies?.gsid as string | undefined) ?? undefined;
    if (gsid) {
      try {
        const payload = jwt.verify(gsid, env.JWT_GUEST_SESSION_SECRET) as { sessionId: string };
        await prisma.guestSession.update({
          where: { id: payload.sessionId },
          data: { userId: user.id },
        });
      } catch {
        // ignore
      }
    }

    res.json({ ok: true, user: { id: user.id, name: user.name, phone: user.phone, email: user.email } });
  })
);

// ✅ НОВОЕ: фронту нужно понять залогинен ли гость (uid cookie httpOnly)
authRouter.get(
  "/guest/me",
  asyncHandler(async (req, res) => {
    const uid = (req.cookies?.uid as string | undefined) ?? undefined;
    if (!uid) return res.json({ authenticated: false });

    try {
      const payload = jwt.verify(uid, env.JWT_USER_SECRET) as { userId: string; role: string };

      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return res.json({ authenticated: false });

      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
      });
    } catch {
      return res.json({ authenticated: false });
    }
  })
);

authRouter.post(
  "/guest/logout",
  asyncHandler(async (_req, res) => {
    clearCookie(res, "uid");
    res.json({ ok: true });
  })
);
