import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { io } from "../realtime/socket";

const addContactSchema = z
  .object({
    name: z.string().min(2).max(80),
    phone: z.string().min(6).max(30).optional(),
    email: z.string().email().optional()
  })
  .refine((v) => v.phone || v.email, { message: "Either phone or email required" });

export const addTrustedContactHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = addContactSchema.parse(req.body);

  const contact = await prisma.trustedContact.create({
    data: {
      userId,
      name: body.name,
      phone: body.phone?.trim(),
      email: body.email?.toLowerCase()
    }
  });

  res.json({ ok: true, contact });
});

export const listTrustedContactsHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const contacts = await prisma.trustedContact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  res.json({ ok: true, contacts });
});

export const deleteTrustedContactHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const id = z.string().parse(req.params.id);

  const contact = await prisma.trustedContact.findUnique({ where: { id } });
  if (!contact || contact.userId !== userId) throw new HttpError(404, "CONTACT_NOT_FOUND", "Contact not found");

  await prisma.trustedContact.delete({ where: { id } });

  res.json({ ok: true });
});

const shareStartSchema = z.object({
  rideId: z.string().min(5)
});

export const startShareTripHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = shareStartSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === userId || ride.driverId === userId;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  const token = `${body.rideId}.${Date.now()}.${Math.random().toString(16).slice(2)}`;

  const ev = await prisma.safetyEvent.create({
    data: {
      userId,
      rideId: body.rideId,
      type: "SHARE_STARTED",
      payload: { token }
    }
  });

  io.to(`user:${userId}`).emit("safety_event", { ...ev, payload: ev.payload });
  io.to(`ride:${body.rideId}`).emit("safety_event", { ...ev, payload: ev.payload });

  res.json({ ok: true, share: { rideId: body.rideId, token } });
});

const shareStopSchema = z.object({
  rideId: z.string().min(5)
});

export const stopShareTripHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = shareStopSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === userId || ride.driverId === userId;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  const ev = await prisma.safetyEvent.create({
    data: {
      userId,
      rideId: body.rideId,
      type: "SHARE_STOPPED",
      payload: {}
    }
  });

  io.to(`user:${userId}`).emit("safety_event", { ...ev, payload: ev.payload });
  io.to(`ride:${body.rideId}`).emit("safety_event", { ...ev, payload: ev.payload });

  res.json({ ok: true });
});

const sosSchema = z.object({
  rideId: z.string().min(5).optional(),
  message: z.string().max(500).optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

export const sosHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = sosSchema.parse(req.body);

  if (body.rideId) {
    const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
    if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
    const allowed = ride.passengerId === userId || ride.driverId === userId;
    if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");
  }

  const ev = await prisma.safetyEvent.create({
    data: {
      userId,
      rideId: body.rideId ?? null,
      type: "SOS",
      payload: {
        message: body.message ?? null,
        lat: body.lat ?? null,
        lng: body.lng ?? null
      }
    }
  });

  io.to(`user:${userId}`).emit("safety_event", { ...ev, payload: ev.payload });
  if (body.rideId) io.to(`ride:${body.rideId}`).emit("safety_event", { ...ev, payload: ev.payload });

  res.json({ ok: true, eventId: ev.id });
});

export const listSafetyEventsHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const events = await prisma.safetyEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  res.json({ ok: true, events });
});
