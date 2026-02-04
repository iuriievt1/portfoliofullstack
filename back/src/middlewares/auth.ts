import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "UNAUTHORIZED", "Missing token");
  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
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
