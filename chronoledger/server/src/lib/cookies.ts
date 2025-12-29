import type { Response } from "express";
import { config } from "../config.js";

export const REFRESH_COOKIE = "cl_refresh";

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: "lax",
    domain: config.COOKIE_DOMAIN || undefined,
    path: "/api/auth/refresh",
    maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: "lax",
    domain: config.COOKIE_DOMAIN || undefined,
    path: "/api/auth/refresh"
  });
}
