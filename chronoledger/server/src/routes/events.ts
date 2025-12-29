import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireOrgMember } from "../middlewares/org.js";
import { computeEventHash, reduceEvents } from "../lib/ledger.js";
import { emitOrg } from "../lib/realtime.js";

const r = Router();

const eventType = z.enum(["CARD_CREATED", "CARD_UPDATED", "CARD_MOVED", "CARD_ARCHIVED"]);

const appendSchema = z.object({
  type: eventType,
  payload: z.record(z.any()).default({})
});

async function getEffectiveEvents(orgId: string, branchId: string, at?: Date) {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, orgId } });
  if (!branch) throw Object.assign(new Error("Branch not found"), { status: 404 });

  const dateFilter = at ? { lte: at } : undefined;

  let parentEvents: any[] = [];
  if (branch.parentBranchId) {
    const all = await prisma.ledgerEvent.findMany({
      where: { orgId, branchId: branch.parentBranchId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
      orderBy: { createdAt: "asc" }
    });

    if (branch.baseEventId) {
      const idx = all.findIndex((e) => e.id === branch.baseEventId);
      parentEvents = idx >= 0 ? all.slice(0, idx + 1) : all;
    } else if (branch.baseHash && branch.baseHash !== "GENESIS") {
      const idx = all.findIndex((e) => e.hash === branch.baseHash);
      parentEvents = idx >= 0 ? all.slice(0, idx + 1) : all;
    } else {
      parentEvents = [];
    }
  }

  const branchEvents = await prisma.ledgerEvent.findMany({
    where: { orgId, branchId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
    orderBy: { createdAt: "asc" }
  });

  return { branch, parentEvents, branchEvents, events: [...parentEvents, ...branchEvents] };
}

function verifySegment(events: any[], startHash: string) {
  let prev = startHash;
  for (const e of events) {
    if (e.prevHash !== prev) {
      return { ok: false, badEventId: e.id, reason: "prevHash mismatch" };
    }
    const computed = computeEventHash(e.prevHash, {
      type: e.type,
      payload: e.payload,
      actorId: e.actorId,
      createdAtISO: new Date(e.createdAt).toISOString()
    });
    if (computed !== e.hash) {
      return { ok: false, badEventId: e.id, reason: "hash mismatch" };
    }
    prev = e.hash;
  }
  return { ok: true, head: prev };
}

r.get("/:orgId/branches/:branchId/events", requireAuth, requireOrgMember, async (req, res, next) => {
  try {
    const { events, parentEvents } = await getEffectiveEvents(req.orgId!, req.params.branchId);
    res.json({ events, parentCount: parentEvents.length });
  } catch (e) {
    next(e);
  }
});

r.post("/:orgId/branches/:branchId/events", requireAuth, requireOrgMember, async (req, res, next) => {
  try {
    const body = appendSchema.parse(req.body);
    const orgId = req.orgId!;
    const branchId = req.params.branchId;

    const branch = await prisma.branch.findFirst({ where: { id: branchId, orgId } });
    if (!branch) return next(Object.assign(new Error("Branch not found"), { status: 404 }));

    const createdAt = new Date();
    const prevHash = branch.headHash || (branch.baseHash ?? "GENESIS");
    const hash = computeEventHash(prevHash, {
      type: body.type,
      payload: body.payload,
      actorId: req.user!.id,
      createdAtISO: createdAt.toISOString()
    });

    const event = await prisma.ledgerEvent.create({
      data: {
        orgId,
        branchId,
        actorId: req.user!.id,
        type: body.type,
        payload: body.payload,
        createdAt,
        prevHash,
        hash
      }
    });

    await prisma.branch.update({ where: { id: branchId }, data: { headHash: hash } });

    emitOrg(req.app, orgId, "event:new", { branchId, event });

    res.json({ event });
  } catch (e) {
    next(e);
  }
});

r.get("/:orgId/branches/:branchId/state", requireAuth, requireOrgMember, async (req, res, next) => {
  try {
    const at = req.query.at ? new Date(String(req.query.at)) : undefined;
    if (at && isNaN(at.getTime())) return next(Object.assign(new Error("Invalid 'at'"), { status: 400 }));

    const { events } = await getEffectiveEvents(req.orgId!, req.params.branchId, at);
    const state = reduceEvents(events);
    res.json({ state, at: at ? at.toISOString() : null, eventCount: events.length });
  } catch (e) {
    next(e);
  }
});

r.get("/:orgId/branches/:branchId/verify", requireAuth, requireOrgMember, async (req, res, next) => {
  try {
    const orgId = req.orgId!;
    const branchId = req.params.branchId;
    const { branch, parentEvents, branchEvents } = await getEffectiveEvents(orgId, branchId);

    const parentCheck = verifySegment(parentEvents, "GENESIS");
    if (!parentCheck.ok) {
      return res.json({ ok: false, where: "parent", ...parentCheck, checked: parentEvents.length });
    }

    const baseHash = branch.parentBranchId ? (branch.baseHash ?? "GENESIS") : "GENESIS";
    if (branch.parentBranchId && baseHash !== "GENESIS") {
      // ensure parent head at fork matches baseHash
      if (parentCheck.head !== baseHash) {
        return res.json({ ok: false, where: "fork", reason: "baseHash not equal to parent head", expected: baseHash, actual: parentCheck.head });
      }
    }

    const branchCheck = verifySegment(branchEvents, baseHash);
    if (!branchCheck.ok) {
      return res.json({ ok: false, where: "branch", ...branchCheck, checked: branchEvents.length });
    }

    res.json({
      ok: true,
      parentCount: parentEvents.length,
      branchCount: branchEvents.length,
      head: branchCheck.head
    });
  } catch (e) {
    next(e);
  }
});

export default r;
