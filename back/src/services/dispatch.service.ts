import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { io } from "../realtime/socket";
import { findNearestDrivers, pushRideOffersToDrivers } from "./match.service";
import { DriverStatus } from "@prisma/client";

const LOCK_PREFIX = "dispatch:ride:";
const MAX_WAVES = 3;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ✅ fallback: если geo/redis вернул пусто — берём из БД ONLINE драйверов
async function fallbackDriversFromDb(exclude: Set<string>, limit: number) {
  const notIn = Array.from(exclude);
  const rows = await prisma.driverProfile.findMany({
    where: {
      status: DriverStatus.ONLINE,
      isBusy: false,
      ...(notIn.length ? { userId: { notIn } } : {})
    },
    select: { userId: true },
    take: limit
  });
  return rows.map((r) => r.userId);
}

export async function dispatchRide(rideId: string) {
  const lockKey = `${LOCK_PREFIX}${rideId}`;
  const ttlSeconds = MAX_WAVES * (env.OFFER_EXPIRES_SECONDS + 2);

  const locked = await redis.set(lockKey, "1", { NX: true, EX: ttlSeconds });
  if (!locked) return;

  try {
    for (let wave = 1; wave <= MAX_WAVES; wave++) {
      const ride = await prisma.ride.findUnique({ where: { id: rideId } });
      if (!ride) return;

      if (ride.status !== "SEARCHING_DRIVER") return;

      const already = await prisma.rideOffer.findMany({
        where: { rideId },
        select: { driverId: true }
      });
      const exclude = new Set(already.map((x) => x.driverId));

      const radiusMeters = env.MATCH_RADIUS_METERS * wave;

      // geo candidates (redis)
      const candidates = await findNearestDrivers(ride.pickupLat, ride.pickupLng, {
        radiusMeters,
        count: env.MATCH_MAX_DRIVERS * MAX_WAVES
      });

      let batch = candidates
        .filter((id) => !exclude.has(id))
        .slice(0, env.MATCH_MAX_DRIVERS);

      // ✅ если geo ничего не дал — fallback на БД
      let fallbackUsed = false;
      if (batch.length === 0) {
        const fb = await fallbackDriversFromDb(exclude, env.MATCH_MAX_DRIVERS);
        batch = fb;
        fallbackUsed = true;
      }

      logger.info(
        { rideId, wave, radiusMeters, candidatesCount: candidates.length, batchSize: batch.length, fallbackUsed },
        "Dispatch wave"
      );

      if (batch.length > 0) {
        await pushRideOffersToDrivers(rideId, batch);
      }

      io.to(`user:${ride.passengerId}`).emit("match_wave", { rideId, wave, radiusMeters });

      await sleep(env.OFFER_EXPIRES_SECONDS * 1000);
    }

    const finalRide = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!finalRide) return;

    if (finalRide.status === "SEARCHING_DRIVER") {
      const updated = await prisma.ride.update({
        where: { id: rideId },
        data: {
          status: "NO_DRIVERS",
          canceledAt: new Date(),
          cancelReason: "NO_DRIVERS"
        }
      });

      io.to(`ride:${rideId}`).emit("ride_updated", { rideId, status: updated.status });
      io.to(`user:${updated.passengerId}`).emit("match_timeout", { rideId });

      logger.info({ rideId }, "Dispatch timeout -> NO_DRIVERS");
    }
  } finally {
    await redis.del(lockKey);
  }
}
