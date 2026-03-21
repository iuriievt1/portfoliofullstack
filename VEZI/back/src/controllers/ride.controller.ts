import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { io } from "../realtime/socket";
import {
  applyPassengerCancellation,
  applyDriverCancellation,
  updateRideStatusByDriver,
  applyNoShow
} from "../services/ride.service";

const ACTIVE_STATUSES = [
  "CREATED",
  "SEARCHING_DRIVER",
  "DRIVER_ASSIGNED",
  "DRIVER_ARRIVING",
  "DRIVER_WAITING",
  "IN_PROGRESS"
] as const;

function attachLastLocation(ride: any) {
  const lastLocation = ride.locations?.[0] ?? null;
  const { locations, ...rest } = ride;
  return { ...rest, lastLocation };
}

/**
 * ✅ Ride Details API
 * GET /rides/:id
 */
export const getRideHandler = asyncHandler(async (req, res) => {
  const rideId = z.string().min(1).parse(req.params.id);
  const user = req.user!;

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      tariff: true,
      passenger: { select: { id: true, fullName: true, phone: true } },
      driver: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          driverProfile: { include: { vehicle: true } }
        }
      },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      locations: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === user.id || ride.driverId === user.id;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  res.json({ ok: true, ride: attachLastLocation(ride) });
});

/**
 * ✅ Chat message
 * POST /rides/message
 */
const msgSchema = z.object({
  rideId: z.string().min(1),
  text: z.string().min(1).max(1000)
});

export const postMessageHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const body = msgSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  if (ride.passengerId !== user.id && ride.driverId !== user.id) {
    throw new HttpError(403, "FORBIDDEN", "Not your ride");
  }

  const msg = await prisma.message.create({
    data: { rideId: body.rideId, userId: user.id, text: body.text }
  });

  io.to(`ride:${body.rideId}`).emit("chat_message", {
    rideId: body.rideId,
    userId: user.id,
    text: msg.text,
    createdAt: msg.createdAt
  });

  res.json({ ok: true, message: msg });
});

/**
 * ✅ Unified: My active ride (PASSENGER/DRIVER)
 * GET /rides/active
 */
export const getMyActiveRideHandler = asyncHandler(async (req, res) => {
  const user = req.user!;

  const where =
    user.role === "PASSENGER"
      ? { passengerId: user.id, status: { in: [...ACTIVE_STATUSES] as any } }
      : { driverId: user.id, status: { in: [...ACTIVE_STATUSES] as any } };

  const ride = await prisma.ride.findFirst({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      tariff: true,
      passenger: { select: { id: true, fullName: true, phone: true } },
      driver: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          driverProfile: { include: { vehicle: true } }
        }
      },
      locations: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  res.json({ ok: true, ride: ride ? attachLastLocation(ride) : null });
});

/**
 * ✅ Unified: My rides history (PASSENGER/DRIVER)
 * GET /rides
 */
export const listMyRidesHandler = asyncHandler(async (req, res) => {
  const user = req.user!;

  const where = user.role === "PASSENGER" ? { passengerId: user.id } : { driverId: user.id };

  const rides = await prisma.ride.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      tariff: true,
      passenger: { select: { id: true, fullName: true, phone: true } },
      driver: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          driverProfile: { include: { vehicle: true } }
        }
      },
      locations: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  res.json({ ok: true, rides: rides.map(attachLastLocation) });
});

/**
 * ✅ Unified cancel (PASSENGER/DRIVER)
 * POST /rides/:id/cancel
 */
const cancelSchema = z.object({
  reason: z.string().min(2).max(200)
});

export const cancelRideUnifiedHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const rideId = z.string().min(1).parse(req.params.id);
  const body = cancelSchema.parse(req.body);

  if (user.role === "PASSENGER") {
    const updated = await applyPassengerCancellation(rideId, user.id, body.reason);

    // refund loyalty + удалить promo reservation (как у тебя было)
    await prisma.$transaction(async (tx) => {
      const rideDb = await tx.ride.findUnique({ where: { id: rideId } });
      if (!rideDb) return;

      if (rideDb.loyaltyDiscountCents > 0 && !rideDb.loyaltyReverted) {
        await tx.user.update({
          where: { id: rideDb.passengerId },
          data: { passengerLoyaltyCredits: { increment: 1 } }
        });
        await tx.ride.update({ where: { id: rideId }, data: { loyaltyReverted: true } });
      }

      await tx.promoRedemption.deleteMany({ where: { rideId } });
    });

    res.json({ ok: true, ride: updated });
    return;
  }

  if (user.role === "DRIVER") {
    const updated = await applyDriverCancellation(rideId, user.id, body.reason);
    res.json({ ok: true, ride: updated });
    return;
  }

  throw new HttpError(403, "FORBIDDEN", "Role not allowed");
});

/**
 * ✅ Driver ride actions (единый стиль через /rides)
 * POST /rides/:id/status
 * POST /rides/:id/location
 * POST /rides/:id/no-show
 */
const driverStatusSchema = z.object({
  status: z.enum(["DRIVER_ARRIVING", "DRIVER_WAITING", "IN_PROGRESS", "COMPLETED"])
});

export const updateRideStatusDriverHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const rideId = z.string().min(1).parse(req.params.id);
  const body = driverStatusSchema.parse(req.body);

  const updated = await updateRideStatusByDriver(rideId, driverId, body.status);
  res.json({ ok: true, ride: updated });
});

const rideLocationSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const postRideLocationHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const rideId = z.string().min(1).parse(req.params.id);
  const body = rideLocationSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.driverId !== driverId) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  await prisma.rideLocation.create({
    data: { rideId, lat: body.lat, lng: body.lng }
  });

  io.to(`ride:${rideId}`).emit("driver_location", {
    rideId,
    lat: body.lat,
    lng: body.lng,
    ts: Date.now()
  });

  res.json({ ok: true });
});

const noShowSchema = z.object({
  note: z.string().min(1).max(200).optional()
});

export const noShowRideHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const rideId = z.string().min(1).parse(req.params.id);
  const body = noShowSchema.parse(req.body);

  const updated = await applyNoShow(rideId, driverId, body.note ?? "NO_NOTE");
  res.json({ ok: true, ride: updated });
});
