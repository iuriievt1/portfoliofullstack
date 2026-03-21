import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import {
  createOrGetPaymentIntentForRide,
  capturePaymentForRideTx
} from "../services/payment.service";

const createIntentSchema = z.object({
  rideId: z.string().min(5)
});

export const createPaymentIntentHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "PASSENGER") throw new HttpError(403, "FORBIDDEN", "Passenger only");

  const body = createIntentSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.passengerId !== user.id) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  if (ride.paymentMethod === "CASH") {
    throw new HttpError(409, "CASH_RIDE", "Cash ride does not use payment intent");
  }

  const amountCents = ride.priceFinalCents ?? ride.priceEstimatedCents;

  const payment = await prisma.$transaction(async (tx) => {
    return createOrGetPaymentIntentForRide(tx, {
      rideId: ride.id,
      passengerId: user.id,
      method: ride.paymentMethod as "CARD" | "APPLE_PAY",
      amountCents,
      currency: "CZK"
    });
  });

  res.json({ ok: true, payment });
});

export const getMyRidePaymentHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "PASSENGER") throw new HttpError(403, "FORBIDDEN", "Passenger only");

  const rideId = z.string().min(5).parse(req.params.rideId);

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.passengerId !== user.id) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  const payment = await prisma.ridePayment.findUnique({ where: { rideId } });
  res.json({ ok: true, payment });
});

const confirmSchema = z.object({
  rideId: z.string().min(5),
  note: z.string().max(500).optional()
});

export const confirmPaymentMockHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "PASSENGER") throw new HttpError(403, "FORBIDDEN", "Passenger only");

  const body = confirmSchema.parse(req.body);

  const ride = await prisma.ride.findUnique({ where: { id: body.rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.passengerId !== user.id) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  if (ride.paymentMethod === "CASH") {
    throw new HttpError(409, "CASH_RIDE", "Cash ride does not use payment confirm");
  }

  const amountCents = ride.priceFinalCents ?? ride.priceEstimatedCents;

  const payment = await prisma.$transaction(async (tx) => {
    return capturePaymentForRideTx(tx, {
      rideId: ride.id,
      passengerId: user.id,
      method: ride.paymentMethod as "CARD" | "APPLE_PAY",
      amountCents,
      currency: "CZK",
      note: body.note ?? "passenger confirm"
    });
  });

  res.json({ ok: true, payment });
});
