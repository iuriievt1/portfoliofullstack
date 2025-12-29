import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthUser = { id: string; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as any;
    req.user = { id: String(payload.sub), email: String(payload.email) };
    return next();
  } catch {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }
}
