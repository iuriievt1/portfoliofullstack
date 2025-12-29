import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { io } from "../realtime/socket";

const GEO_KEY = "drivers:online";

export async function setDriverOnline(driverUserId: string, lat: number, lng: number) {
  await redis.geoAdd(GEO_KEY, { member: `driver:${driverUserId}`, longitude: lng, latitude: lat });
}

export async function setDriverOffline(driverUserId: string) {
  await redis.zRem(GEO_KEY, `driver:${driverUserId}`);
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

  return res.map((m) => m.replace("driver:", "")).filter(Boolean);
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

// старый метод оставляем для совместимости (1 волна)
export async function pushRideOffers(rideId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) return;
  if (ride.status !== "SEARCHING_DRIVER") return;

  const drivers = await findNearestDrivers(ride.pickupLat, ride.pickupLng);
  if (drivers.length === 0) {
    logger.info({ rideId }, "No drivers found in radius");
    return;
  }

  await pushRideOffersToDrivers(rideId, drivers);
}
