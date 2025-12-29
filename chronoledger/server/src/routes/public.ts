import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sha256 } from "../lib/hash.js";
import { computeEventHash } from "../lib/ledger.js";
import { emitOrg } from "../lib/realtime.js";

const r = Router();

const ingestSchema = z.object({
  orgSlug: z.string().min(2),
  branch: z.string().optional().default("main"),
  type: z.enum(["CARD_CREATED", "CARD_UPDATED", "CARD_MOVED", "CARD_ARCHIVED"]),
  payload: z.record(z.any()).default({})
});

r.post("/append", async (req, res, next) => {
  try {
    const apiKey = String(req.header("x-api-key") || "");
    if (!apiKey) return next(Object.assign(new Error("Missing X-Api-Key"), { status: 401 }));

    const body = ingestSchema.parse(req.body);

    const org = await prisma.org.findUnique({ where: { slug: body.orgSlug } });
    if (!org) return next(Object.assign(new Error("Org not found"), { status: 404 }));

    const keyHash = sha256(apiKey);
    const keyRow = await prisma.apiKey.findFirst({
      where: { orgId: org.id, keyHash, revokedAt: null }
    });
    if (!keyRow) return next(Object.assign(new Error("Unauthorized"), { status: 401 }));

    const branch = await prisma.branch.findFirst({ where: { orgId: org.id, name: body.branch } });
    if (!branch) return next(Object.assign(new Error("Branch not found"), { status: 404 }));

    // system actor (no user): we store a special user per org? simplest: use first owner
    const owner = await prisma.orgMember.findFirst({ where: { orgId: org.id, role: "OWNER" }, select: { userId: true } });
    if (!owner) return next(Object.assign(new Error("Org owner missing"), { status: 500 }));

    const createdAt = new Date();
    const prevHash = branch.headHash || (branch.baseHash ?? "GENESIS");
    const hash = computeEventHash(prevHash, {
      type: body.type,
      payload: body.payload,
      actorId: owner.userId,
      createdAtISO: createdAt.toISOString()
    });

    const event = await prisma.ledgerEvent.create({
      data: {
        orgId: org.id,
        branchId: branch.id,
        actorId: owner.userId,
        type: body.type,
        payload: body.payload,
        createdAt,
        prevHash,
        hash
      }
    });

    await prisma.branch.update({ where: { id: branch.id }, data: { headHash: hash } });

    emitOrg(req.app, org.id, "event:new", { branchId: branch.id, event });

    res.json({ ok: true, eventId: event.id });
  } catch (e) {
    next(e);
  }
});

export default r;
