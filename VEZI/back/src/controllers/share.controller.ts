import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

function buildShareUrl(token: string) {
  const base = (env as any).PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
  const path = `/api/public/share/${token}`;
  return { url: base ? `${base}${path}` : path, path };
}

function addMinutes(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60_000);
}

const startSchema = z.object({
  rideId: z.string().min(1),
  expiresInMinutes: z.number().int().positive().max(7 * 24 * 60).optional()
});

export const startShareHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const body = startSchema.parse(req.body);

  const now = new Date();
  const ttlMin = body.expiresInMinutes ?? (env as any).SHARE_LINK_TTL_MINUTES ?? 120;
  const endsAt = addMinutes(now, ttlMin);

  const result = await prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findUnique({ where: { id: body.rideId } });
    if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

    const isParticipant = ride.passengerId === user.id || ride.driverId === user.id;
    if (!isParticipant) throw new HttpError(403, "FORBIDDEN", "Not your ride");

    // остановим предыдущие активные пользователя поездке
    await tx.rideShare.updateMany({
      where: { rideId: ride.id, userId: user.id, status: "ACTIVE" },
      data: { status: "STOPPED", stoppedAt: now }
    });

    const token = crypto.randomBytes(24).toString("base64url");

    const share = await tx.rideShare.create({
      data: {
        token,
        rideId: ride.id,
        userId: user.id,
        status: "ACTIVE",
        startedAt: now,
        endsAt,
        meta: { v: 1 }
      }
    });

    await tx.safetyEvent.create({
      data: {
        userId: user.id,
        rideId: ride.id,
        type: "SHARE_STARTED",
        payload: { shareId: share.id, endsAt: share.endsAt }
      }
    });

    return share;
  });

  const link = buildShareUrl(result.token);
  res.json({ ok: true, share: result, link });
});

export const stopShareHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const shareId = z.string().min(1).parse(req.params.id);
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const share = await tx.rideShare.findUnique({ where: { id: shareId } });
    if (!share) throw new HttpError(404, "SHARE_NOT_FOUND", "Share not found");

    const ride = await tx.ride.findUnique({ where: { id: share.rideId } });
    if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

    const isParticipant = ride.passengerId === user.id || ride.driverId === user.id;
    if (!isParticipant) throw new HttpError(403, "FORBIDDEN", "Not your ride");

    // уже не активен
    if (share.status !== "ACTIVE") return share;

    const s = await tx.rideShare.update({
      where: { id: shareId },
      data: { status: "STOPPED", stoppedAt: now }
    });

    await tx.safetyEvent.create({
      data: {
        userId: user.id,
        rideId: share.rideId,
        type: "SHARE_STOPPED",
        payload: { shareId: s.id }
      }
    });

    return s;
  });

  res.json({ ok: true, share: updated });
});

export const getActiveShareHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const rideId = z.string().min(1).parse(req.query.rideId);

  const now = new Date();

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const isParticipant = ride.passengerId === user.id || ride.driverId === user.id;
  if (!isParticipant) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  // expire
  await prisma.rideShare.updateMany({
    where: { rideId, status: "ACTIVE", endsAt: { lte: now } },
    data: { status: "EXPIRED" }
  });

  const share = await prisma.rideShare.findFirst({
    where: { rideId, userId: user.id, status: "ACTIVE", endsAt: { gt: now } },
    orderBy: { endsAt: "desc" }
  });

  res.json({ ok: true, share: share ?? null, link: share ? buildShareUrl(share.token) : null });
});
