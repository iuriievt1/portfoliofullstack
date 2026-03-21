import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { requestOtp, verifyOtp } from "../services/otp.service";
import { sendEmail, sendSms } from "../services/notify.service";
import { sha256, signAccessToken, signRefreshToken, verifyRefreshToken } from "../services/token.service";
import { env } from "../config/env";

const normPhone = (p: string) => p.replace(/\s+/g, "");

async function ensureRoleProfiles(userId: string, role: "PASSENGER" | "DRIVER") {
  if (role === "PASSENGER") {
    // passengerProfile обычно без обязательных полей — но делаем upsert на всякий
    await prisma.passengerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });
    return;
  }

  // DRIVER: чаще всего есть обязательные поля/дефолты — зададим безопасный минимум
  await prisma.driverProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      status: "OFFLINE",
      isBusy: false
    }
  });
}

const requestOtpSchema = z.object({
  phone: z.string().min(6),
  // делаем email опциональным в dev, чтобы smoke/ручные curl не ломались
  email: z.string().email().optional(),
  role: z.enum(["PASSENGER", "DRIVER"]),
  fullName: z.string().min(2).max(120).optional(),
  language: z.string().min(2).max(5).optional()
});

export const requestOtpHandler = asyncHandler(async (req, res) => {
  const body = requestOtpSchema.parse(req.body);

  const phone = normPhone(body.phone);

  // если email не прислали — в dev сгенерим, в prod запретим
  const email =
    (body.email?.toLowerCase() ??
      (env.NODE_ENV === "development"
        ? `user_${phone.replace(/[^\d]/g, "")}@test.local`
        : undefined));

  if (!email) {
    throw new HttpError(400, "EMAIL_REQUIRED", "email is required");
  }

  // upsert user
  const user = await prisma.user.upsert({
    where: { phone },
    create: {
      phone,
      email,
      role: body.role,
      fullName: body.fullName,
      language: body.language ?? "cs"
    },
    update: {
      email,
      role: body.role,
      fullName: body.fullName ?? undefined,
      language: body.language ?? undefined
    }
  });

  // ✅ гарантируем наличие профиля под роль (иначе потом /driver/availability даст 404)
  await ensureRoleProfiles(user.id, body.role);

  // OTP
  const { code } = await requestOtp(phone);

  // уведомления
  await sendSms(user.phone, `VEZI code: ${code}`);
  if (email) await sendEmail(email, "VEZI verification code", `Your VEZI code: ${code}`);

  res.json({
    ok: true,
    userId: user.id,
    devCode: env.NODE_ENV === "development" ? code : undefined
  });
});

const verifyOtpSchema = z.object({
  phone: z.string().min(6),
  code: z.string().min(4).max(10)
});

export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const body = verifyOtpSchema.parse(req.body);
  const phone = normPhone(body.phone);

  await verifyOtp(phone, body.code);

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User not found");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isPhoneVerified: true, isEmailVerified: true }
  });

  // ✅ ещё раз гарантируем профиль (если роль менялась/данные мигрировали)
  await ensureRoleProfiles(updated.id, updated.role as "PASSENGER" | "DRIVER");

  const accessToken = signAccessToken({ sub: updated.id, role: updated.role });
  const refreshToken = signRefreshToken({ sub: updated.id, role: updated.role });

  await prisma.refreshToken.create({
    data: {
      userId: updated.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 3600 * 1000)
    }
  });

  res.json({
    ok: true,
    tokens: { accessToken, refreshToken },
    user: {
      id: updated.id,
      role: updated.role,
      phone: updated.phone,
      email: updated.email,
      fullName: updated.fullName,
      language: updated.language
    }
  });
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const body = refreshSchema.parse(req.body);

  const payload = verifyRefreshToken(body.refreshToken);
  const userId = payload.sub as string;
  const role = payload.role as "PASSENGER" | "DRIVER";

  const tokenHash = sha256(body.refreshToken);
  const existing = await prisma.refreshToken.findFirst({
    where: { userId, tokenHash, revokedAt: null }
  });
  if (!existing) throw new HttpError(401, "REFRESH_INVALID", "Refresh token invalid");

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() }
  });

  const accessToken = signAccessToken({ sub: userId, role });
  const newRefresh = signRefreshToken({ sub: userId, role });

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256(newRefresh),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 3600 * 1000)
    }
  });

  res.json({ ok: true, tokens: { accessToken, refreshToken: newRefresh } });
});

const logoutSchema = z.object({
  refreshToken: z.string().min(20)
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const body = logoutSchema.parse(req.body);
  const tokenHash = sha256(body.refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  res.json({ ok: true });
});
