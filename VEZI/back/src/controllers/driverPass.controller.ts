import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

async function expirePassesIfNeeded(driverId: string) {
  const now = new Date();
  await prisma.driverPass.updateMany({
    where: { driverId, status: "ACTIVE", endsAt: { lte: now } },
    data: { status: "EXPIRED" }
  });
}

export const listPassPlansHandler = asyncHandler(async (_req, res) => {
  const plans = await prisma.passPlan.findMany({
    where: { isActive: true },
    orderBy: { priceCents: "asc" }
  });
  res.json({ ok: true, plans });
});

export const getActivePassHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  await expirePassesIfNeeded(driverId);

  const now = new Date();
  const pass = await prisma.driverPass.findFirst({
    where: { driverId, status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now } },
    include: { plan: true },
    orderBy: { endsAt: "desc" }
  });

  res.json({ ok: true, pass });
});

const purchaseSchema = z.object({
  planId: z.string().min(1)
});

export const purchasePassHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = purchaseSchema.parse(req.body);

  await expirePassesIfNeeded(driverId);

  const plan = await prisma.passPlan.findUnique({ where: { id: body.planId } });
  if (!plan || !plan.isActive) throw new HttpError(404, "PLAN_NOT_FOUND", "Pass plan not found");

  const now = new Date();

  const active = await prisma.driverPass.findFirst({
    where: { driverId, status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now } }
  });
  if (active) throw new HttpError(409, "ACTIVE_PASS_EXISTS", "You already have an active pass");

  const created = await prisma.$transaction(async (tx) => {
    const pass = await tx.driverPass.create({
      data: {
        driverId,
        planId: plan.id,
        status: "ACTIVE",
        startsAt: now,
        endsAt: addMinutes(now, plan.durationMin),
        priceCents: plan.priceCents,
        currency: plan.currency,
        meta: { purchasedBy: "api", v: 1 }
      },
      include: { plan: true }
    });

    // v1: просто фиксируем покупку в wallet (как “списание” и “доход платформы”)
    await tx.walletEntry.create({
      data: {
        userId: driverId,
        rideId: null,
        type: "ADJUSTMENT",
        amountCents: -plan.priceCents,
        meta: { kind: "PASS_PURCHASE", passId: pass.id, planId: plan.id }
      }
    });

    await tx.walletEntry.create({
      data: {
        userId: null,
        rideId: null,
        type: "ADJUSTMENT",
        amountCents: plan.priceCents,
        meta: { kind: "PASS_PURCHASE", passId: pass.id, planId: plan.id }
      }
    });

    return pass;
  }); 

  res.json({ ok: true, pass: created });
});
