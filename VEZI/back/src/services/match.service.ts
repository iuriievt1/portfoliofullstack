import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { io } from "../realtime/socket";

const GEO_KEY = "drivers:online";

// TTL-key
const TTL_PREFIX = "drivers:online:ttl:";
const ONLINE_TTL_SECONDS = Math.max(
  60,
  Number((env as any).DRIVER_ONLINE_TTL_SECONDS ?? 90)
);

function ttlKey(driverUserId: string) {
  return `${TTL_PREFIX}${driverUserId}`;
}

export async function setDriverOnline(driverUserId: string, lat: number, lng: number) {
  // GEO + heartbeat TTL
  const multi = redis.multi();
  multi.geoAdd(GEO_KEY, { member: `driver:${driverUserId}`, longitude: lng, latitude: lat });
  multi.set(ttlKey(driverUserId), "1", { EX: ONLINE_TTL_SECONDS });
  await multi.exec();
}

export async function setDriverOffline(driverUserId: string) {
  const multi = redis.multi();
  multi.zRem(GEO_KEY, `driver:${driverUserId}`);
  multi.del(ttlKey(driverUserId));
  await multi.exec();
}

export async function findNearestDrivers(
  lat: number,
  lng: number,
  options?: { radiusMeters?: number; count?: number }
) {
  const radiusMeters = options?.radiusMeters ?? env.MATCH_RADIUS_METERS;
  const count = options?.count ?? env.MATCH_MAX_DRIVERS;

  const res = await redis.geoSearch(
    GEO_KEY,
    { longitude: lng, latitude: lat },
    { radius: radiusMeters, unit: "m" },
    { SORT: "ASC", COUNT: count }
  );

  const ids = res.map((m) => m.replace("driver:", "")).filter(Boolean);
  if (ids.length === 0) return [];

  // live TTL
  const keys = ids.map(ttlKey);
  const alive = await redis.mGet(keys);

  const aliveIds: string[] = [];
  const staleMembers: string[] = [];

  for (let i = 0; i < ids.length; i++) {
    if (alive[i]) aliveIds.push(ids[i]);
    else staleMembers.push(`driver:${ids[i]}`);
  }

  // GEO clean fall
  if (staleMembers.length) {
    await redis.zRem(GEO_KEY, staleMembers);
  }

  return aliveIds;
}

export async function pushRideOffersToDrivers(rideId: string, driverIds: string[]) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) return;
  if (ride.status !== "SEARCHING_DRIVER") return;

  const expiresAt = new Date(Date.now() + env.OFFER_EXPIRES_SECONDS * 1000);

  for (const driverId of driverIds) {
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      include: { driverProfile: true }
    });

    if (!driver?.driverProfile) continue;
    if (driver.driverProfile.status !== "ONLINE") continue;
    if (driver.driverProfile.isBusy) continue;

    await prisma.rideOffer.upsert({
      where: { rideId_driverId: { rideId, driverId } },
      create: { rideId, driverId, status: "SENT", expiresAt },
      update: { status: "SENT", expiresAt }
    });

    io.to(`user:${driverId}`).emit("ride_offer", {
      rideId,
      pickupAddress: ride.pickupAddress,
      destinationAddress: ride.destinationAddress,
      priceEstimatedCents: ride.priceEstimatedCents,
      tariffId: ride.tariffId,
      expiresAt
    });
  }

  logger.info({ rideId, offers: driverIds.length }, "Ride offers pushed");
}
