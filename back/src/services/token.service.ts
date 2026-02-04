import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export type AccessTokenPayload = { sub: string; role: "PASSENGER" | "DRIVER" };

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(
    { role: payload.role },
    env.JWT_ACCESS_SECRET,
    { subject: payload.sub, expiresIn: env.ACCESS_TOKEN_TTL_SECONDS }
  );
}

export function signRefreshToken(payload: AccessTokenPayload) {
  const expiresInSeconds = env.REFRESH_TOKEN_TTL_DAYS * 24 * 3600;
  return jwt.sign(
    { role: payload.role },
    env.JWT_REFRESH_SECRET,
    { subject: payload.sub, expiresIn: expiresInSeconds }
  );
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
