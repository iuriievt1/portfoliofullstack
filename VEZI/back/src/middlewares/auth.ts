import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

type JwtPayload = { sub?: string; role?: "PASSENGER" | "DRIVER" };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "UNAUTHORIZED", "Missing token");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) throw new HttpError(401, "UNAUTHORIZED", "Missing token");

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    if (!payload.sub || !payload.role) {
      throw new HttpError(401, "UNAUTHORIZED", "Invalid token");
    }

    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e: any) {
    if (e?.name === "TokenExpiredError") {
      throw new HttpError(401, "TOKEN_EXPIRED", "Access token expired");
    }
    throw new HttpError(401, "UNAUTHORIZED", "Invalid token");
  }
}

export function requireRole(role: "PASSENGER" | "DRIVER") {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, "UNAUTHORIZED", "Missing token");
    if (req.user.role !== role) throw new HttpError(403, "FORBIDDEN", "Insufficient role");
    next();
  };
}