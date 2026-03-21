import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { io } from "../realtime/socket";

const MAX_TRUSTED_CONTACTS = 10;
const DEFAULT_SHARE_TTL_MIN = 24 * 60; // 24h

function normalizePhone(phone?: string) {
  if (!phone) return undefined;
  return phone.replace(/\s+/g, "");
}

function normalizeEmail(email?: string) {
  if (!email) return undefined;
  return email.trim().toLowerCase();
}

function buildShareToken() {
  // короткий безопасный токен
  return crypto.randomBytes(18).toString("base64url");
}

/* Trusted Contacts*/
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

  const count = await prisma.trustedContact.count({ where: { userId } });
  if (count >= MAX_TRUSTED_CONTACTS) {
    throw new HttpError(409, "CONTACTS_LIMIT", `Max ${MAX_TRUSTED_CONTACTS} trusted contacts`);
  }

  const contact = await prisma.trustedContact.create({
    data: {
      userId,
      name: body.name.trim(),
      phone: normalizePhone(body.phone),
      email: normalizeEmail(body.email)
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
  const id = z.string().min(1).parse(req.params.id);

  const contact = await prisma.trustedContact.findUnique({ where: { id } });
  if (!contact || contact.userId !== userId) {
    throw new HttpError(404, "CONTACT_NOT_FOUND", "Contact not found");
  }

  await prisma.trustedContact.delete({ where: { id } });

  res.json({ ok: true });
});

/*Share trip start/stop*/
const shareStartSchema = z.object({
  rideId: z.string().min(5),
  ttlMinutes: z.number().int().positive().max(7 * 24 * 60).optional() // максимум 7 дней
});

export const startShareTripHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = shareStartSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({
    where: { id: body.rideId },
    select: { id: true, passengerId: true, driverId: true }
  });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === userId || ride.driverId === userId;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  const token = buildShareToken();
  const ttlMin = body.ttlMinutes ?? DEFAULT_SHARE_TTL_MIN;
  const expiresAt = new Date(Date.now() + ttlMin * 60_000);

  const ev = await prisma.safetyEvent.create({
    data: {
      userId,
      rideId: body.rideId,
      type: "SHARE_STARTED",
      payload: { token, expiresAt: expiresAt.toISOString(), ttlMin }
    }
  });

  // realtime
  io.to(`user:${userId}`).emit("safety_event", {
    id: ev.id,
    type: ev.type,
    rideId: ev.rideId,
    userId: ev.userId,
    payload: ev.payload,
    createdAt: ev.createdAt
  });
  io.to(`ride:${body.rideId}`).emit("safety_event", {
    id: ev.id,
    type: ev.type,
    rideId: ev.rideId,
    userId: ev.userId,
    payload: ev.payload,
    createdAt: ev.createdAt
  });

  res.json({ ok: true, share: { rideId: body.rideId, token, expiresAt } });
});

const shareStopSchema = z.object({
  rideId: z.string().min(5),
  token: z.string().min(10).optional()
});

export const stopShareTripHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = shareStopSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({
    where: { id: body.rideId },
    select: { id: true, passengerId: true, driverId: true }
  });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === userId || ride.driverId === userId;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  // если token не передали SHARE_STARTED пользователя для поездки
  let token = body.token;

  if (!token) {
    const lastStart = await prisma.safetyEvent.findFirst({
      where: { userId, rideId: body.rideId, type: "SHARE_STARTED" },
      orderBy: { createdAt: "desc" }
    });

    const payload = (lastStart?.payload ?? {}) as any;
    token = typeof payload.token === "string" ? payload.token : undefined;

    if (!token) throw new HttpError(409, "NO_ACTIVE_SHARE", "No share token to stop");
  }

  const ev = await prisma.safetyEvent.create({
    data: {
      userId,
      rideId: body.rideId,
      type: "SHARE_STOPPED",
      payload: { token }
    }
  });

  io.to(`user:${userId}`).emit("safety_event", {
    id: ev.id,
    type: ev.type,
    rideId: ev.rideId,
    userId: ev.userId,
    payload: ev.payload,
    createdAt: ev.createdAt
  });
  io.to(`ride:${body.rideId}`).emit("safety_event", {
    id: ev.id,
    type: ev.type,
    rideId: ev.rideId,
    userId: ev.userId,
    payload: ev.payload,
    createdAt: ev.createdAt
  });

  res.json({ ok: true });
});

/* SOS*/
const sosSchema = z.object({
  rideId: z.string().min(5).optional(),
  // message и note
  message: z.string().max(500).optional(),
  note: z.string().max(500).optional(),
  lat: z.number().optional(),
  lng: z.number().optional()
});

export const sosHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = sosSchema.parse(req.body);

  if (body.rideId) {
    const ride = await prisma.ride.findUnique({
      where: { id: body.rideId },
      select: { passengerId: true, driverId: true }
    });
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
        note: body.note ?? body.message ?? null,
        lat: body.lat ?? null,
        lng: body.lng ?? null
      }
    }
  });

  io.to(`user:${userId}`).emit("safety_event", {
    id: ev.id,
    type: ev.type,
    rideId: ev.rideId,
    userId: ev.userId,
    payload: ev.payload,
    createdAt: ev.createdAt
  });
  if (body.rideId) {
    io.to(`ride:${body.rideId}`).emit("safety_event", {
      id: ev.id,
      type: ev.type,
      rideId: ev.rideId,
      userId: ev.userId,
      payload: ev.payload,
      createdAt: ev.createdAt
    });
  }

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

/* (NO AUTH)
 * GET /api/safety/share/:token*/
export const publicShareViewHandler = asyncHandler(async (req, res) => {
  const token = z.string().min(10).parse(req.params.token);

  //JSON filter
  const start = await prisma.safetyEvent.findFirst({
    where: {
      type: "SHARE_STARTED",
      payload: { path: ["token"], equals: token }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!start || !start.rideId) throw new HttpError(404, "SHARE_NOT_FOUND", "Share not found");

  const startPayload = (start.payload ?? {}) as any;
  const expiresAtStr = typeof startPayload.expiresAt === "string" ? startPayload.expiresAt : null;
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

  if (expiresAt && Date.now() > expiresAt.getTime()) {
    throw new HttpError(410, "SHARE_EXPIRED", "Share expired");
  }

  const stop = await prisma.safetyEvent.findFirst({
    where: {
      type: "SHARE_STOPPED",
      rideId: start.rideId,
      payload: { path: ["token"], equals: token },
      createdAt: { gt: start.createdAt }
    },
    orderBy: { createdAt: "desc" }
  });

  // МИНИМУМ: без телефона пассажира и тд
  const ride = await prisma.ride.findUnique({
    where: { id: start.rideId },
    include: {
      tariff: true,
      driver: {
        select: {
          id: true,
          fullName: true,
          driverProfile: { include: { vehicle: true } }
        }
      },
      locations: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const lastLocation = ride.locations?.[0] ?? null;

  res.json({
    ok: true,
    share: {
      token,
      rideId: ride.id,
      startedAt: start.createdAt,
      stoppedAt: stop?.createdAt ?? null,
      expiresAt
    },
    ride: {
      id: ride.id,
      status: ride.status,
      pickupAddress: ride.pickupAddress,
      destinationAddress: ride.destinationAddress,
      tariff: ride.tariff ? { id: ride.tariff.id, name: ride.tariff.name } : null,
      driver: ride.driver
        ? {
            id: ride.driver.id,
            fullName: ride.driver.fullName,
            vehicle: ride.driver.driverProfile?.vehicle
              ? {
                  plate: ride.driver.driverProfile.vehicle.plate,
                  brandModel: ride.driver.driverProfile.vehicle.brandModel,
                  color: ride.driver.driverProfile.vehicle.color,
                  category: ride.driver.driverProfile.vehicle.category
                }
              : null
          }
        : null,
      lastLocation: lastLocation
        ? { lat: lastLocation.lat, lng: lastLocation.lng, createdAt: lastLocation.createdAt }
        : null
    }
  });
});
