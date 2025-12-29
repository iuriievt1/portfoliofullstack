import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { io } from "../realtime/socket";
import { findNearestDrivers, pushRideOffersToDrivers } from "./match.service";

const LOCK_PREFIX = "dispatch:ride:";

// v1 настройки (можно потом вынести в env)
const MAX_WAVES = 3;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function dispatchRide(rideId: string) {
  const lockKey = `${LOCK_PREFIX}${rideId}`;
  const ttlSeconds = MAX_WAVES * (env.OFFER_EXPIRES_SECONDS + 2);

  // защита от двойного запуска диспетчера для одной поездки
  const locked = await redis.set(lockKey, "1", { NX: true, EX: ttlSeconds });
  if (!locked) return;

  try {
    for (let wave = 1; wave <= MAX_WAVES; wave++) {
      const ride = await prisma.ride.findUnique({ where: { id: rideId } });
      if (!ride) return;

      // если поездку уже приняли/отменили — прекращаем диспетчер
      if (ride.status !== "SEARCHING_DRIVER") return;

      // исключаем водителей, которым уже слали оффер (любой статус)
      const already = await prisma.rideOffer.findMany({
        where: { rideId },
        select: { driverId: true }
      });
      const exclude = new Set(already.map((x) => x.driverId));

      // расширяем радиус волнами: 1x, 2x, 3x
      const radiusMeters = env.MATCH_RADIUS_METERS * wave;

      // берем больше кандидатов, чтобы после фильтра было из чего выбрать
      const candidates = await findNearestDrivers(ride.pickupLat, ride.pickupLng, {
        radiusMeters,
        count: env.MATCH_MAX_DRIVERS * MAX_WAVES
      });

      const batch = candidates
        .filter((id) => !exclude.has(id))
        .slice(0, env.MATCH_MAX_DRIVERS);

      logger.info({ rideId, wave, radiusMeters, batchSize: batch.length }, "Dispatch wave");

      if (batch.length > 0) {
        await pushRideOffersToDrivers(rideId, batch);
      }

      // (опционально) пушим прогресс пассажиру
      io.to(`user:${ride.passengerId}`).emit("match_wave", { rideId, wave, radiusMeters });

      // ждём, пока офферы живут
      await sleep(env.OFFER_EXPIRES_SECONDS * 1000);
    }

    // финальная проверка: если всё ещё ищем — ставим NO_DRIVERS
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
