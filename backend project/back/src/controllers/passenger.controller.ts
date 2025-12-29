import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { guardSingleActiveRide, applyPassengerCancellation } from "../services/ride.service";
import { io } from "../realtime/socket";
import { computeRidePricing } from "../services/discount.service";
import { HttpError } from "../utils/httpError";
import { dispatchRide } from "../services/dispatch.service";


const createRideSchema = z.object({
  pickupAddress: z.string().min(3),
  pickupLat: z.number(),
  pickupLng: z.number(),
  destinationAddress: z.string().min(3),
  destinationLat: z.number(),
  destinationLng: z.number(),
  tariffId: z.string().min(1),
  distanceMeters: z.number().optional(),
  durationSeconds: z.number().optional(),
  paymentMethod: z.enum(["CARD", "APPLE_PAY", "CASH"]),

  promoCode: z.string().optional(),
  useLoyalty: z.boolean().optional()
});

export const createRideHandler = asyncHandler(async (req, res) => {
  const passengerId = req.user!.id;
  const body = createRideSchema.parse(req.body);

  await guardSingleActiveRide(passengerId);

  const pricing = await computeRidePricing({
    userId: passengerId,
    tariffId: body.tariffId,
    pickupLat: body.pickupLat,
    pickupLng: body.pickupLng,
    destinationLat: body.destinationLat,
    destinationLng: body.destinationLng,
    distanceMeters: body.distanceMeters,
    durationSeconds: body.durationSeconds,
    promoCode: body.promoCode,
    useLoyalty: body.useLoyalty
  });

  const ride = await prisma.$transaction(async (tx) => {
    // списать loyalty credit (если применился)
    if (pricing.loyaltyDiscountCents > 0) {
      await tx.user.update({
        where: { id: passengerId },
        data: { passengerLoyaltyCredits: { decrement: 1 } }
      });
    }

    const created = await tx.ride.create({
      data: {
        passengerId,
        pickupAddress: body.pickupAddress,
        pickupLat: body.pickupLat,
        pickupLng: body.pickupLng,
        destinationAddress: body.destinationAddress,
        destinationLat: body.destinationLat,
        destinationLng: body.destinationLng,
        tariffId: body.tariffId,
        paymentMethod: body.paymentMethod,
        status: "SEARCHING_DRIVER",

        priceEstimatedCents: pricing.priceEstimatedCents,
        priceFinalCents: pricing.priceFinalCents,

        promoCodeId: pricing.promoCodeId,
        promoDiscountCents: pricing.promoDiscountCents,
        loyaltyDiscountCents: pricing.loyaltyDiscountCents
      }
    });

    // резерв промокода на поездку
    if (pricing.promoCodeId) {
      await tx.promoRedemption.create({
        data: { promoCodeId: pricing.promoCodeId, userId: passengerId, rideId: created.id }
      });
    }

    return created;
  });

  // realtime
  io.to(`user:${passengerId}`).emit("ride_created", { rideId: ride.id });

  // матчинг (не блокируем ответ)
  void dispatchRide(ride.id);

  res.json({ ok: true, ride, pricing });
});

export const getActiveRideHandler = asyncHandler(async (req, res) => {
  const passengerId = req.user!.id;
  const ride = await prisma.ride.findFirst({
    where: {
      passengerId,
      status: {
        in: [
          "CREATED",
          "SEARCHING_DRIVER",
          "DRIVER_ASSIGNED",
          "DRIVER_ARRIVING",
          "DRIVER_WAITING",
          "IN_PROGRESS"
        ]
      }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ ok: true, ride });
});

export const listRidesHandler = asyncHandler(async (req, res) => {
  const passengerId = req.user!.id;
  const rides = await prisma.ride.findMany({
    where: { passengerId },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  res.json({ ok: true, rides });
});

const cancelSchema = z.object({ reason: z.string().min(2).max(200) });

export const cancelRideHandler = asyncHandler(async (req, res) => {
  const passengerId = req.user!.id;
  const rideId = z.string().parse(req.params.id);
  const body = cancelSchema.parse(req.body);

  const updated = await applyPassengerCancellation(rideId, passengerId, body.reason);

  // refund loyalty + удалить promo reservation
  await prisma.$transaction(async (tx) => {
    const rideDb = await tx.ride.findUnique({ where: { id: rideId } });
    if (!rideDb) return;

    // вернуть credit только один раз
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
});

/**
 * Доп. эндпоинты (если ты их уже добавлял ранее — оставь, если нет — всё ок)
 */

const estimateSchema = z.object({
  tariffId: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  destinationLat: z.number(),
  destinationLng: z.number(),
  distanceMeters: z.number().optional(),
  durationSeconds: z.number().optional(),
  promoCode: z.string().optional(),
  useLoyalty: z.boolean().optional()
});

export const estimateRideHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = estimateSchema.parse(req.body);

  const pricing = await computeRidePricing({
    userId,
    tariffId: body.tariffId,
    pickupLat: body.pickupLat,
    pickupLng: body.pickupLng,
    destinationLat: body.destinationLat,
    destinationLng: body.destinationLng,
    distanceMeters: body.distanceMeters,
    durationSeconds: body.durationSeconds,
    promoCode: body.promoCode,
    useLoyalty: body.useLoyalty
  });

  res.json({ ok: true, pricing });
});

export const loyaltyStatusHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passengerCompletedRides: true, passengerLoyaltyCredits: true }
  });
  if (!user) throw new HttpError(404, "USER_NOT_FOUND", "User not found");

  const completed = user.passengerCompletedRides;
  const progressIn10 = completed % 10; // 0..9
  const ridesToNext = progressIn10 === 0 ? 10 : 10 - progressIn10;

  res.json({
    ok: true,
    loyalty: {
      completedRides: completed,
      credits: user.passengerLoyaltyCredits,
      progressIn10,
      ridesToNextReward: ridesToNext
    }
  });
});
