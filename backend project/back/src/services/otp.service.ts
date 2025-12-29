import { redis } from "../config/redis";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

function digits(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

function otpKey(phone: string) {
  return `otp:phone:${normalizePhone(phone)}`;
}

function rateKey(phone: string) {
  return `otp:rate:${normalizePhone(phone)}`;
}

export async function requestOtp(phoneRaw: string) {
  const phone = normalizePhone(phoneRaw);
  const rKey = rateKey(phone);
  const used = Number(await redis.get(rKey) ?? "0");
  if (used >= env.OTP_RATE_LIMIT_PER_PHONE_PER_HOUR) {
    throw new HttpError(429, "OTP_RATE_LIMIT", "Too many OTP requests. Try later.");
  }

  const code = digits(env.OTP_LENGTH);
  await redis.setEx(otpKey(phone), env.OTP_TTL_SECONDS, code);

  // rate limit counter for 1 hour
  const ttl = await redis.ttl(rKey);
  if (ttl < 0) {
    await redis.setEx(rKey, 3600, "1");
  } else {
    await redis.incr(rKey);
  }

  return { phone, code, ttlSeconds: env.OTP_TTL_SECONDS };
}

export async function verifyOtp(phoneRaw: string, code: string) {
  const phone = normalizePhone(phoneRaw);
  const saved = await redis.get(otpKey(phone));
  if (!saved) throw new HttpError(400, "OTP_EXPIRED", "OTP expired");
  if (saved !== code) throw new HttpError(400, "OTP_INVALID", "OTP invalid");

  await redis.del(otpKey(phone));
  return { phone };
}
