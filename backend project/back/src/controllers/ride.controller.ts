import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { io } from "../realtime/socket";

export const getRideHandler = asyncHandler(async (req, res) => {
  const rideId = z.string().parse(req.params.id);
  const user = req.user!;

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      passenger: { select: { id: true, fullName: true, phone: true } },
      driver: { select: { id: true, fullName: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200 }
    }
  });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = (ride.passengerId === user.id) || (ride.driverId === user.id);
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  res.json({ ok: true, ride });
});

const msgSchema = z.object({
  rideId: z.string().min(1),
  text: z.string().min(1).max(1000)
});

export const postMessageHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const body = msgSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.passengerId !== user.id && ride.driverId !== user.id) throw new HttpError(403, "FORBIDDEN", "Not your ride");

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
