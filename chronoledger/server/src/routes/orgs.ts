import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { config } from "../config.js";
import { sha256 } from "../lib/hash.js";

const r = Router();

const createOrgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/i)
});

r.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = createOrgSchema.parse(req.body);

    const exists = await prisma.org.findUnique({ where: { slug: body.slug } });
    if (exists) return next(Object.assign(new Error("Slug already used"), { status: 409 }));

    const org = await prisma.org.create({
      data: {
        name: body.name,
        slug: body.slug,
        members: {
          create: { userId: req.user!.id, role: "OWNER" }
        },
        branches: {
          create: { name: "main", headHash: "GENESIS", baseHash: "GENESIS" }
        },
        apiKeys: {
          create: { name: "default", keyHash: sha256(config.PUBLIC_INGEST_API_KEY) }
        }
      }
    });

    res.json({ org });
  } catch (e) {
    next(e);
  }
});

r.get("/current", requireAuth, async (req, res, next) => {
  try {
    const membership = await prisma.orgMember.findFirst({
      where: { userId: req.user!.id },
      include: { org: true }
    });
    if (!membership) return next(Object.assign(new Error("No org"), { status: 404 }));

    const branches = await prisma.branch.findMany({
      where: { orgId: membership.orgId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, parentBranchId: true, baseEventId: true, baseHash: true, headHash: true, createdAt: true }
    });

    res.json({
      org: membership.org,
      role: membership.role,
      branches
    });
  } catch (e) {
    next(e);
  }
});

export default r;
