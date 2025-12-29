import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireOrgMember } from "../middlewares/org.js";
import { emitOrg } from "../lib/realtime.js";

const r = Router();

r.get("/:orgId/branches", requireAuth, requireOrgMember, async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      where: { orgId: req.orgId! },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, parentBranchId: true, baseEventId: true, baseHash: true, headHash: true, createdAt: true }
    });
    res.json({ branches });
  } catch (e) {
    next(e);
  }
});

const createBranchSchema = z.object({
  name: z.string().min(2).regex(/^[a-z0-9-_]+$/i),
  parentBranchId: z.string().optional(),
  baseEventId: z.string().optional()
});

r.post("/:orgId/branches", requireAuth, requireOrgMember, async (req, res, next) => {
  try {
    const body = createBranchSchema.parse(req.body);

    let baseHash = "GENESIS";
    let headHash = "GENESIS";
    let parentBranchId: string | null = null;
    let baseEventId: string | null = null;

    if (body.parentBranchId) {
      parentBranchId = body.parentBranchId;
      const parent = await prisma.branch.findFirst({ where: { id: parentBranchId, orgId: req.orgId! } });
      if (!parent) return next(Object.assign(new Error("Parent branch not found"), { status: 404 }));

      if (body.baseEventId) {
        baseEventId = body.baseEventId;
        const baseEvent = await prisma.ledgerEvent.findFirst({
          where: { id: baseEventId, orgId: req.orgId!, branchId: parentBranchId },
          select: { hash: true }
        });
        if (!baseEvent) return next(Object.assign(new Error("Base event not found"), { status: 404 }));
        baseHash = baseEvent.hash;
        headHash = baseHash;
      } else {
        // fork from current head of parent
        baseHash = parent.headHash;
        headHash = baseHash;
      }
    }

    const branch = await prisma.branch.create({
      data: {
        orgId: req.orgId!,
        name: body.name,
        parentBranchId,
        baseEventId,
        baseHash,
        headHash
      },
      select: { id: true, name: true, parentBranchId: true, baseEventId: true, baseHash: true, headHash: true, createdAt: true }
    });

    emitOrg(req.app, req.orgId!, "branch:new", branch);
    res.json({ branch });
  } catch (e) {
    next(e);
  }
});

export default r;
