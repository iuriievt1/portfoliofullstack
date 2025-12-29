import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { setDriverOnline, setDriverOffline } from "../services/match.service";
import { updateRideStatusByDriver, applyDriverCancellation, applyNoShow } from "../services/ride.service";
import { io } from "../realtime/socket";

const availabilitySchema = z.object({
  online: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

export const setAvailabilityHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = availabilitySchema.parse(req.body);

  const profile = await prisma.driverProfile.findUnique({ where: { userId: driverId } });
  if (!profile) throw new HttpError(404, "DRIVER_PROFILE_NOT_FOUND", "Driver profile not found");

  if (body.online) {
    if (profile.status === "SUSPENDED") throw new HttpError(403, "SUSPENDED", "Driver suspended");
    if (profile.status === "PENDING_VERIFICATION") throw new HttpError(403, "NOT_VERIFIED", "Driver not verified yet");
    if (typeof body.lat !== "number" || typeof body.lng !== "number")
      throw new HttpError(400, "LOCATION_REQUIRED", "lat/lng required to go online");

    await prisma.driverProfile.update({ where: { userId: driverId }, data: { status: "ONLINE" } });
    await setDriverOnline(driverId, body.lat, body.lng);
  } else {
    if (profile.isBusy) throw new HttpError(409, "DRIVER_BUSY", "Driver is busy");
    await prisma.driverProfile.update({ where: { userId: driverId }, data: { status: "OFFLINE" } });
    await setDriverOffline(driverId);
  }

  res.json({ ok: true });
});

export const listOffersHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const now = new Date();

  await prisma.rideOffer.updateMany({
    where: { driverId, status: "SENT", expiresAt: { lt: now } },
    data: { status: "EXPIRED" }
  });

  const offers = await prisma.rideOffer.findMany({
    where: { driverId, status: "SENT", expiresAt: { gt: now } },
    include: { ride: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  res.json({ ok: true, offers });
});

const acceptSchema = z.object({ rideId: z.string().min(1) });

export const acceptOfferHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = acceptSchema.parse(req.body);

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const ride = await tx.ride.findUnique({ where: { id: body.rideId } });
    if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
    if (ride.status !== "SEARCHING_DRIVER") throw new HttpError(409, "RIDE_NOT_AVAILABLE", "Ride not available");

    const profile = await tx.driverProfile.findUnique({ where: { userId: driverId } });
    if (!profile) throw new HttpError(404, "DRIVER_PROFILE_NOT_FOUND", "Driver profile not found");
    if (profile.status !== "ONLINE") throw new HttpError(409, "DRIVER_NOT_ONLINE", "Driver not online");
    if (profile.isBusy) throw new HttpError(409, "DRIVER_BUSY", "Driver busy");

    const offer = await tx.rideOffer.findUnique({
      where: { rideId_driverId: { rideId: body.rideId, driverId } }
    });

    if (!offer || offer.status !== "SENT") throw new HttpError(409, "OFFER_NOT_FOUND", "No active offer for this ride");
    if (offer.expiresAt < now) {
      await tx.rideOffer.update({
        where: { rideId_driverId: { rideId: body.rideId, driverId } },
        data: { status: "EXPIRED" }
      });
      throw new HttpError(409, "OFFER_EXPIRED", "Offer expired");
    }

    await tx.rideOffer.update({
      where: { rideId_driverId: { rideId: body.rideId, driverId } },
      data: { status: "ACCEPTED" }
    });

    await tx.rideOffer.updateMany({
      where: { rideId: body.rideId, driverId: { not: driverId }, status: "SENT" },
      data: { status: "EXPIRED" }
    });

    const updatedRide = await tx.ride.update({
      where: { id: body.rideId },
      data: { driverId, status: "DRIVER_ASSIGNED", assignedAt: new Date() }
    });

    await tx.driverProfile.update({ where: { userId: driverId }, data: { isBusy: true } });

    return updatedRide;
  });

  io.to(`ride:${result.id}`).emit("ride_updated", { rideId: result.id, status: result.status, driverId });
  io.to(`user:${result.passengerId}`).emit("driver_assigned", { rideId: result.id, driverId });
  io.to(`user:${driverId}`).emit("offer_accepted", { rideId: result.id });

  res.json({ ok: true, ride: result });
});

const declineSchema = z.object({
  rideId: z.string().min(1),
  reason: z.string().min(2).max(200)
});

export const declineOfferHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = declineSchema.parse(req.body);

  await prisma.rideOffer.updateMany({
    where: { rideId: body.rideId, driverId, status: "SENT" },
    data: { status: "DECLINED", reason: body.reason }
  });

  res.json({ ok: true });
});

const statusSchema = z.object({
  rideId: z.string().min(1),
  status: z.enum(["DRIVER_ARRIVING", "DRIVER_WAITING", "IN_PROGRESS", "COMPLETED"])
});

export const updateRideStatusHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = statusSchema.parse(req.body);

  const updated = await updateRideStatusByDriver(body.rideId, driverId, body.status);
  res.json({ ok: true, ride: updated });
});

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  rideId: z.string().optional()
});

export const postLocationHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = locationSchema.parse(req.body);

  const profile = await prisma.driverProfile.findUnique({ where: { userId: driverId } });
  if (profile?.status === "ONLINE") {
    await setDriverOnline(driverId, body.lat, body.lng);
  }

  if (body.rideId) {
    const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
    if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
    if (ride.driverId !== driverId) throw new HttpError(403, "FORBIDDEN", "Not your ride");

    await prisma.rideLocation.create({
      data: { rideId: body.rideId, lat: body.lat, lng: body.lng }
    });

    io.to(`ride:${body.rideId}`).emit("driver_location", {
      rideId: body.rideId,
      lat: body.lat,
      lng: body.lng,
      ts: Date.now()
    });
  }

  res.json({ ok: true });
});

// ✅ Driver cancel -> redispatch
const driverCancelSchema = z.object({
  rideId: z.string().min(1),
  reason: z.string().min(2).max(200)
});

export const driverCancelRideHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = driverCancelSchema.parse(req.body);

  const updated = await applyDriverCancellation(body.rideId, driverId, body.reason);
  res.json({ ok: true, ride: updated });
});

// ✅ NO_SHOW
const noShowSchema = z.object({
  rideId: z.string().min(1),
  note: z.string().min(1).max(200).optional()
});

export const noShowHandler = asyncHandler(async (req, res) => {
  const driverId = req.user!.id;
  const body = noShowSchema.parse(req.body);

  const updated = await applyNoShow(body.rideId, driverId, body.note ?? "NO_NOTE");
  res.json({ ok: true, ride: updated });
});
