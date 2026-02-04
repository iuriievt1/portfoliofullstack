import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";
import { io } from "../realtime/socket";
import { dispatchRide } from "./dispatch.service";
import { PaymentProvider, RidePaymentStatus } from "@prisma/client";

export function isActiveStatus(status: string) {
  return [
    "CREATED",
    "SEARCHING_DRIVER",
    "DRIVER_ASSIGNED",
    "DRIVER_ARRIVING",
    "DRIVER_WAITING",
    "IN_PROGRESS"
  ].includes(status);
}

export async function guardSingleActiveRide(passengerId: string) {
  const active = await prisma.ride.findFirst({
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
    }
  });
  if (active) throw new HttpError(409, "ACTIVE_RIDE_EXISTS", "Passenger already has an active ride");
}

export async function applyPassengerCancellation(rideId: string, passengerId: string, reason: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { passenger: true, driver: true }
  });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.passengerId !== passengerId) throw new HttpError(403, "FORBIDDEN", "Not your ride");
  if (!isActiveStatus(ride.status)) throw new HttpError(409, "RIDE_NOT_ACTIVE", "Ride is not cancellable");

  const now = Date.now();
  const assignedAge = ride.assignedAt ? now - ride.assignedAt.getTime() : 0;

  const feeApplies =
    ["DRIVER_ARRIVING", "DRIVER_WAITING"].includes(ride.status) ||
    (ride.status === "DRIVER_ASSIGNED" && assignedAge >= 60_000);

  const fee = feeApplies ? env.CANCEL_FEE_CENTS : 0;
  const currency = "CZK";

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.ride.update({
      where: { id: rideId },
      data: {
        status: "CANCELED_BY_PASSENGER",
        canceledAt: new Date(),
        cancelReason: reason,
        cancellationFeeCents: fee
      }
    });

    if (fee > 0) {
      // ✅ фиксируем payment (MOCK) — для CASH это "CREATED" (долг),
      // для CARD/APPLE_PAY это "CAPTURED" (как будто списали)
      const payStatus: RidePaymentStatus =
        ride.paymentMethod === "CASH" ? "CREATED" : "CAPTURED";

      await tx.ridePayment.upsert({
        where: { rideId: ride.id },
        create: {
          rideId: ride.id,
          passengerId: ride.passengerId,
          method: ride.paymentMethod,
          amountCents: fee,
          currency,
          status: payStatus,
          provider: PaymentProvider.MOCK,
          meta: { v: 1, kind: "CANCEL_FEE", reason, paymentMethod: ride.paymentMethod }
        },
        update: {
          method: ride.paymentMethod,
          amountCents: fee,
          currency,
          status: payStatus,
          provider: PaymentProvider.MOCK,
          meta: { v: 1, kind: "CANCEL_FEE", reason, paymentMethod: ride.paymentMethod }
        }
      });

      // ✅ debt растёт ТОЛЬКО для CASH
      if (ride.paymentMethod === "CASH") {
        const passengerProfile = await tx.passengerProfile.findUnique({ where: { userId: passengerId } });
        if (passengerProfile) {
          await tx.passengerProfile.update({
            where: { userId: passengerId },
            data: { cashDebtCents: passengerProfile.cashDebtCents + fee }
          });
        }
      }

      // ✅ wallet credit (как и раньше)
      if (ride.driverId) {
        await tx.walletEntry.create({
          data: {
            userId: ride.driverId,
            rideId: ride.id,
            type: "CANCEL_FEE",
            amountCents: env.CANCEL_FEE_DRIVER_SHARE_CENTS,
            meta: { policy: "v1", reason, paymentMethod: ride.paymentMethod }
          }
        });
      }

      await tx.walletEntry.create({
        data: {
          userId: null,
          rideId: ride.id,
          type: "CANCEL_FEE",
          amountCents: env.CANCEL_FEE_PLATFORM_SHARE_CENTS,
          meta: { policy: "v1", reason, paymentMethod: ride.paymentMethod }
        }
      });
    }

    if (ride.driverId) {
      await tx.driverProfile.updateMany({
        where: { userId: ride.driverId },
        data: { isBusy: false }
      });
    }

    return r;
  });

  io.to(`ride:${rideId}`).emit("ride_updated", {
    rideId,
    status: updated.status,
    cancellationFeeCents: updated.cancellationFeeCents
  });

  return updated;
}


export async function applyDriverCancellation(rideId: string, driverId: string, reason: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.driverId !== driverId) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  if (ride.status === "COMPLETED") throw new HttpError(409, "RIDE_ALREADY_COMPLETED", "Ride already completed");
  if (ride.status === "CANCELED_BY_PASSENGER" || ride.status === "CANCELED_BY_DRIVER") {
    throw new HttpError(409, "RIDE_ALREADY_CANCELED", "Ride already canceled");
  }

  const canRedispatch = ["DRIVER_ASSIGNED", "DRIVER_ARRIVING", "DRIVER_WAITING"].includes(ride.status);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.driverProfile.updateMany({ where: { userId: driverId }, data: { isBusy: false } });

    await tx.rideOffer.updateMany({
      where: { rideId, driverId, status: { in: ["SENT", "ACCEPTED"] } },
      data: { status: "DECLINED", reason }
    });
    await tx.rideOffer.updateMany({
      where: { rideId, status: "SENT" },
      data: { status: "EXPIRED" }
    });

    if (canRedispatch) {
      return tx.ride.update({
        where: { id: rideId },
        data: {
          driverId: null,
          status: "SEARCHING_DRIVER",
          assignedAt: null,
          arrivingAt: null
        }
      });
    }

    return tx.ride.update({
      where: { id: rideId },
      data: {
        status: "DISPUTED",
        canceledAt: new Date(),
        cancelReason: `DRIVER_CANCEL:${reason}`
      }
    });
  });

  io.to(`ride:${rideId}`).emit("ride_updated", {
    rideId,
    status: updated.status,
    driverId: updated.driverId ?? null
  });
  io.to(`user:${ride.passengerId}`).emit("driver_canceled", { rideId, reason });

  if (updated.status === "SEARCHING_DRIVER") {
    void dispatchRide(rideId);
  }

  return updated;
}

export async function applyNoShow(rideId: string, driverId: string, note: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.driverId !== driverId) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  if (ride.status !== "DRIVER_WAITING") {
    throw new HttpError(409, "NO_SHOW_NOT_ALLOWED", "No-show allowed only in DRIVER_WAITING");
  }

  const fee = env.CANCEL_FEE_CENTS;
  const currency = "CZK";

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.ride.update({
      where: { id: rideId },
      data: {
        status: "NO_SHOW",
        canceledAt: new Date(),
        cancelReason: `NO_SHOW:${note}`,
        cancellationFeeCents: fee
      }
    });

    const payStatus: RidePaymentStatus =
      ride.paymentMethod === "CASH" ? "CREATED" : "CAPTURED";

    await tx.ridePayment.upsert({
      where: { rideId: ride.id },
      create: {
        rideId: ride.id,
        passengerId: ride.passengerId,
        method: ride.paymentMethod,
        amountCents: fee,
        currency,
        status: payStatus,
        provider: PaymentProvider.MOCK,
        meta: { v: 1, kind: "NO_SHOW_FEE", note, paymentMethod: ride.paymentMethod }
      },
      update: {
        method: ride.paymentMethod,
        amountCents: fee,
        currency,
        status: payStatus,
        provider: PaymentProvider.MOCK,
        meta: { v: 1, kind: "NO_SHOW_FEE", note, paymentMethod: ride.paymentMethod }
      }
    });

    // ✅ debt растёт ТОЛЬКО для CASH
    if (ride.paymentMethod === "CASH") {
      const passengerProfile = await tx.passengerProfile.findUnique({ where: { userId: ride.passengerId } });
      if (passengerProfile) {
        await tx.passengerProfile.update({
          where: { userId: ride.passengerId },
          data: { cashDebtCents: passengerProfile.cashDebtCents + fee }
        });
      }
    }

    await tx.walletEntry.create({
      data: {
        userId: driverId,
        rideId,
        type: "CANCEL_FEE",
        amountCents: env.CANCEL_FEE_DRIVER_SHARE_CENTS,
        meta: { policy: "v1", note, paymentMethod: ride.paymentMethod }
      }
    });

    await tx.walletEntry.create({
      data: {
        userId: null,
        rideId,
        type: "CANCEL_FEE",
        amountCents: env.CANCEL_FEE_PLATFORM_SHARE_CENTS,
        meta: { policy: "v1", note, paymentMethod: ride.paymentMethod }
      }
    });

    await tx.driverProfile.updateMany({ where: { userId: driverId }, data: { isBusy: false } });

    return r;
  });

  io.to(`ride:${rideId}`).emit("ride_updated", {
    rideId,
    status: updated.status,
    cancellationFeeCents: updated.cancellationFeeCents
  });

  return updated;
}


export async function updateRideStatusByDriver(rideId: string, driverId: string, nextStatus: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
  if (ride.driverId !== driverId) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  if (ride.status === "COMPLETED") {
    if (nextStatus === "COMPLETED") return ride;
    throw new HttpError(409, "RIDE_ALREADY_COMPLETED", "Ride is already completed");
  }

  const allowed = new Set(["DRIVER_ARRIVING", "DRIVER_WAITING", "IN_PROGRESS", "COMPLETED"]);
  if (!allowed.has(nextStatus)) throw new HttpError(400, "BAD_STATUS", "Status not allowed");

  const data: any = { status: nextStatus };

  if (nextStatus === "DRIVER_ARRIVING") data.arrivingAt = new Date();
  if (nextStatus === "IN_PROGRESS") data.startedAt = new Date();

  if (nextStatus === "COMPLETED") {
    data.completedAt = new Date();
    data.priceFinalCents = ride.priceFinalCents ?? ride.priceEstimatedCents;
  }

  const updated = await prisma.$transaction(async (tx) => {
    let r = await tx.ride.update({ where: { id: rideId }, data });

    if (nextStatus === "COMPLETED") {
      const finalCents = r.priceFinalCents ?? r.priceEstimatedCents;
      const currency = "CZK"; // пока фикс (у тарифов CZK)

      const isCash = r.paymentMethod === "CASH";

      // ✅ RidePayment mock:
      // CASH -> CREATED (не оплачено, долг растёт)
      // CARD/APPLE_PAY -> CAPTURED (оплачено, debt НЕ растёт)
      const paymentStatus: RidePaymentStatus = isCash
        ? RidePaymentStatus.CREATED
        : RidePaymentStatus.CAPTURED;

      await tx.ridePayment.upsert({
        where: { rideId: r.id },
        create: {
          rideId: r.id,
          passengerId: r.passengerId,
          amountCents: finalCents,
          currency,
          method: r.paymentMethod,
          status: paymentStatus,
          provider: PaymentProvider.MOCK,
          meta: { v: 1, kind: "RIDE_FARE", paymentMethod: r.paymentMethod }
        },
        update: {
          amountCents: finalCents,
          currency,
          method: r.paymentMethod,
          status: paymentStatus,
          provider: PaymentProvider.MOCK,
          meta: { v: 1, kind: "RIDE_FARE", paymentMethod: r.paymentMethod }
        }
      });

      // ✅ debt растёт ТОЛЬКО для CASH и ТОЛЬКО 1 раз (idempotency)
      if (isCash) {
        const markDebt = await tx.ride.updateMany({
          where: { id: rideId, cashDebtApplied: false },
          data: { cashDebtApplied: true }
        });

        if (markDebt.count === 1) {
          await tx.passengerProfile.updateMany({
            where: { userId: r.passengerId },
            data: { cashDebtCents: { increment: finalCents } }
          });
        }
      }

      // ✅ комиссия: default 15%, но если активен pass — берём из плана
      let commissionBps = 1500;
      let passMeta: any = {};

      const now = new Date();

      await tx.driverPass.updateMany({
        where: { driverId, status: "ACTIVE", endsAt: { lte: now } },
        data: { status: "EXPIRED" }
      });

      const activePass = await tx.driverPass.findFirst({
        where: { driverId, status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now } },
        include: { plan: true },
        orderBy: { endsAt: "desc" }
      });

      if (activePass?.plan) {
        commissionBps = activePass.plan.commissionBps;
        passMeta = { passId: activePass.id, planId: activePass.planId };
      }

      const driverShare = Math.floor(finalCents * (1 - commissionBps / 10_000));
      const platformShare = finalCents - driverShare;

      await tx.walletEntry.create({
        data: {
          userId: driverId,
          rideId: r.id,
          type: "FARE",
          amountCents: driverShare,
          currency,
          meta: { commissionBps, paymentMethod: r.paymentMethod, paymentStatus, ...passMeta }
        }
      });

      await tx.walletEntry.create({
        data: {
          userId: null,
          rideId: r.id,
          type: "FARE",
          amountCents: platformShare,
          currency,
          meta: { commissionBps, paymentMethod: r.paymentMethod, paymentStatus, ...passMeta }
        }
      });

      await tx.driverProfile.updateMany({ where: { userId: driverId }, data: { isBusy: false } });

      // ✅ Loyalty начисление (один раз)
      const mark = await tx.ride.updateMany({
        where: { id: rideId, rewardsApplied: false },
        data: { rewardsApplied: true }
      });

      if (mark.count === 1) {
        const user = await tx.user.findUnique({
          where: { id: r.passengerId },
          select: { passengerCompletedRides: true }
        });

        const current = user?.passengerCompletedRides ?? 0;
        const next = current + 1;
        const creditInc = next % 10 === 0 ? 1 : 0;

        await tx.user.update({
          where: { id: r.passengerId },
          data: {
            passengerCompletedRides: { increment: 1 },
            ...(creditInc ? { passengerLoyaltyCredits: { increment: 1 } } : {})
          }
        });
      }

      const fresh = await tx.ride.findUnique({ where: { id: rideId } });
      if (fresh) r = fresh;
    }

    return r;
  });

  io.to(`ride:${rideId}`).emit("ride_updated", { rideId, status: updated.status });

  return updated;
}
