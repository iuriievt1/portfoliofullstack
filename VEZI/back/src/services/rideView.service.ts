import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { HttpError } from "../utils/httpError";

const DETAILS_INCLUDE: Prisma.RideInclude = {
  tariff: true,
  passenger: { select: { id: true, fullName: true, phone: true } },
  driver: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      driverProfile: { include: { vehicle: true } }
    }
  },
  messages: { orderBy: { createdAt: "asc" }, take: 200 },
  locations: { orderBy: { createdAt: "desc" }, take: 1 }
};

const LIST_INCLUDE: Prisma.RideInclude = {
  tariff: true,
  passenger: { select: { id: true, fullName: true, phone: true } },
  driver: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      driverProfile: { include: { vehicle: true } }
    }
  },
  locations: { orderBy: { createdAt: "desc" }, take: 1 }
};

function attachLastLocation(ride: any) {
  const lastLocation = ride.locations?.[0] ?? null;
  const { locations, ...rest } = ride;
  return { ...rest, lastLocation };
}

export async function getRideDetailsForUser(rideId: string, userId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: DETAILS_INCLUDE
  });

  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === userId || ride.driverId === userId;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  return attachLastLocation(ride);
}

// пригодится дальше для passenger list/active
export async function getRideListItemForUser(rideId: string, userId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: LIST_INCLUDE
  });

  if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");

  const allowed = ride.passengerId === userId || ride.driverId === userId;
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Not your ride");

  return attachLastLocation(ride);
}

export const rideInclude = {
  DETAILS_INCLUDE,
  LIST_INCLUDE
};
