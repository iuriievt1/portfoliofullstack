import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      orgId?: string;
      role?: "OWNER" | "ADMIN" | "MEMBER";
    }
  }
}

export async function requireOrgMember(req: Request, _res: Response, next: NextFunction) {
  const orgId = req.params.orgId;
  if (!orgId) return next(Object.assign(new Error("Missing orgId"), { status: 400 }));
  if (!req.user) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

  const membership = await prisma.orgMember.findFirst({
    where: { orgId, userId: req.user.id },
    select: { role: true }
  });

  if (!membership) return next(Object.assign(new Error("Forbidden"), { status: 403 }));
  req.orgId = orgId;
  req.role = membership.role;
  next();
}
