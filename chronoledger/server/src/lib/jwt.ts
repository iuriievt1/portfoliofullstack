import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign({ email: user.email }, config.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: config.JWT_ACCESS_TTL_SECONDS
  });
}

export function signRefreshToken(user: { id: string; email: string }) {
  // refresh token doesn't need email, but include for debugging
  return jwt.sign({ email: user.email, kind: "refresh" }, config.JWT_REFRESH_SECRET, {
    subject: user.id,
    expiresIn: `${config.REFRESH_TOKEN_TTL_DAYS}d`
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
}
