import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// --- request payout (driver) ---
const requestPayoutSchema = z.object({
  amountCents: z.number().int().positive().optional(), // если нет — выведем весь доступный баланс
  currency: z.string().min(3).max(10).default("CZK"),
  destination: z.any().optional() // позже: iban/bic/stripeAccountId
});

export const requestPayoutHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "DRIVER") throw new HttpError(403, "FORBIDDEN", "Driver only");

  const body = requestPayoutSchema.parse(req.body);
  const driverId = user.id;
  const currency = body.currency ?? "CZK";

  const payout = await prisma.$transaction(async (tx) => {
    // ✅ базовый KYC-gate (MVP)
    const profile = await tx.driverProfile.findUnique({
      where: { userId: driverId },
      include: { documents: true }
    });
    if (!profile) throw new HttpError(404, "DRIVER_PROFILE_NOT_FOUND", "Driver profile not found");
    if (profile.status === "SUSPENDED") throw new HttpError(403, "SUSPENDED", "Driver suspended");
    if (profile.status === "PENDING_VERIFICATION") {
      throw new HttpError(403, "NOT_VERIFIED", "Driver not verified yet");
    }

    const hasApprovedDoc = (profile.documents ?? []).some((d) => d.status === "APPROVED");
    if (!hasApprovedDoc) throw new HttpError(403, "KYC_REQUIRED", "Approved document required for withdrawals");

    // ✅ нельзя 2 PENDING
    const pending = await tx.walletPayout.findFirst({
      where: { driverId, status: "PENDING" },
      select: { id: true }
    });
    if (pending) throw new HttpError(409, "PAYOUT_ALREADY_PENDING", "You already have a pending payout");

    // ✅ текущий баланс водителя по валюте
    const agg = await tx.walletEntry.aggregate({
      where: { userId: driverId, currency },
      _sum: { amountCents: true }
    });
    const balance = agg._sum.amountCents ?? 0;
    if (balance <= 0) throw new HttpError(409, "INSUFFICIENT_FUNDS", "No funds to withdraw");

    const amount = body.amountCents ?? balance;

    // ✅ лимиты
    if (amount < env.WITHDRAW_MIN_CENTS) {
      throw new HttpError(400, "WITHDRAW_TOO_SMALL", `Minimum withdraw is ${env.WITHDRAW_MIN_CENTS}`);
    }
    if (amount > env.WITHDRAW_MAX_CENTS) {
      throw new HttpError(400, "WITHDRAW_TOO_LARGE", `Maximum withdraw is ${env.WITHDRAW_MAX_CENTS}`);
    }
    if (amount > balance) throw new HttpError(409, "INSUFFICIENT_FUNDS", "Not enough balance");

    // ✅ дневной лимит
    const from = startOfDay(new Date());
    const dayAgg = await tx.walletPayout.aggregate({
      where: {
        driverId,
        currency,
        requestedAt: { gte: from },
        status: { in: ["PENDING", "PAID"] }
      },
      _sum: { amountCents: true }
    });
    const today = dayAgg._sum.amountCents ?? 0;
    if (today + amount > env.WITHDRAW_DAILY_LIMIT_CENTS) {
      throw new HttpError(409, "DAILY_LIMIT", "Daily withdraw limit exceeded");
    }

    // ✅ создаём payout
    const created = await tx.walletPayout.create({
      data: {
        driverId,
        amountCents: amount,
        currency,
        status: "PENDING",
        destination: body.destination ?? {},
        meta: { v: 1, provider: "MANUAL", kind: "PAYOUT_REQUEST" }
      }
    });

    // ✅ списываем баланс сразу (резерв)
    await tx.walletEntry.create({
      data: {
        userId: driverId,
        rideId: null,
        type: "PAYOUT",
        amountCents: -amount,
        currency,
        meta: { payoutId: created.id, status: "PENDING", kind: "RESERVE" }
      }
    });

    return created;
  });

  res.json({ ok: true, payout });
});

// --- list my payouts (driver) ---
export const listMyPayoutsHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "DRIVER") throw new HttpError(403, "FORBIDDEN", "Driver only");

  const payouts = await prisma.walletPayout.findMany({
    where: { driverId: user.id },
    orderBy: { requestedAt: "desc" },
    take: 50
  });

  res.json({ ok: true, payouts });
});

// --- cancel my payout (driver) ---
export const cancelMyPayoutHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "DRIVER") throw new HttpError(403, "FORBIDDEN", "Driver only");

  const payoutId = z.string().min(1).parse(req.params.id);

  const payout = await prisma.$transaction(async (tx) => {
    const p = await tx.walletPayout.findUnique({ where: { id: payoutId } });
    if (!p) throw new HttpError(404, "PAYOUT_NOT_FOUND", "Payout not found");
    if (p.driverId !== user.id) throw new HttpError(403, "FORBIDDEN", "Not your payout");
    if (p.status !== "PENDING") throw new HttpError(409, "NOT_CANCELLABLE", "Only PENDING payout can be canceled");

    const updated = await tx.walletPayout.update({
      where: { id: payoutId },
      data: {
        status: "CANCELED",
        processedAt: new Date(),
        meta: { ...(p.meta as any), cancel: { at: new Date().toISOString() } }
      }
    });

    // refund reserve
    await tx.walletEntry.create({
      data: {
        userId: user.id,
        rideId: null,
        type: "PAYOUT",
        amountCents: p.amountCents,
        currency: p.currency,
        meta: { payoutId: p.id, status: "CANCELED", kind: "REFUND" }
      }
    });

    return updated;
  });

  res.json({ ok: true, payout });
});

// --- internal: list pending payouts ---
export const listPendingPayoutsHandler = asyncHandler(async (_req, res) => {
  const payouts = await prisma.walletPayout.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    take: 200,
    include: {
      driver: { select: { id: true, phone: true, email: true, fullName: true } }
    }
  });

  res.json({ ok: true, payouts });
});

// --- internal: process payout (mark PAID / REJECTED / FAILED + refund) ---
const processSchema = z.object({
  action: z.enum(["PAID", "REJECTED", "FAILED"]),
  note: z.string().min(1).max(500).optional()
});

export const processPayoutHandler = asyncHandler(async (req, res) => {
  const payoutId = z.string().min(1).parse(req.params.id);
  const body = processSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    const p = await tx.walletPayout.findUnique({ where: { id: payoutId } });
    if (!p) throw new HttpError(404, "PAYOUT_NOT_FOUND", "Payout not found");

    if (p.status !== "PENDING") {
      throw new HttpError(409, "PAYOUT_NOT_PENDING", "Only PENDING payout can be processed");
    }

    if (body.action === "PAID") {
      return tx.walletPayout.update({
        where: { id: payoutId },
        data: {
          status: "PAID",
          processedAt: new Date(),
          note: body.note ?? null,
          meta: { ...(p.meta as any), processed: { action: "PAID", at: new Date().toISOString() } }
        }
      });
    }

    // REJECTED / FAILED => refund reserve
    const updated = await tx.walletPayout.update({
      where: { id: payoutId },
      data: {
        status: body.action,
        processedAt: new Date(),
        note: body.note ?? null,
        meta: { ...(p.meta as any), processed: { action: body.action, at: new Date().toISOString() } }
      }
    });

    await tx.walletEntry.create({
      data: {
        userId: p.driverId,
        rideId: null,
        type: "PAYOUT",
        amountCents: p.amountCents,
        currency: p.currency,
        meta: { payoutId: p.id, status: body.action, kind: "REFUND" }
      }
    });

    return updated;
  });

  res.json({ ok: true, payout: result });
});
