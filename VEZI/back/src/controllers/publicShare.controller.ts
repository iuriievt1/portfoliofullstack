import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

function maskPlate(plate?: string | null) {
  if (!plate) return null;
  const s = plate.trim();
  if (s.length <= 3) return "***";
  return `${s.slice(0, 2)}***${s.slice(-1)}`;
}

function attachLastLocation(ride: any) {
  const lastLocation = ride.locations?.[0] ?? null;
  const { locations, ...rest } = ride;
  return { ...rest, lastLocation };
}

export const getPublicSharedRideHandler = asyncHandler(async (req, res) => {
  const token = z.string().min(10).parse(req.params.token);
  const now = new Date();

  const share = await prisma.rideShare.findUnique({ where: { token } });
  if (!share) throw new HttpError(404, "SHARE_NOT_FOUND", "Share not found");

  if (share.status === "ACTIVE" && share.endsAt <= now) {
    await prisma.rideShare.update({ where: { id: share.id }, data: { status: "EXPIRED" } });
  }

  const fresh = await prisma.rideShare.findUnique({ where: { token } });
  if (!fresh || fresh.status !== "ACTIVE" || fresh.endsAt <= now) {
    throw new HttpError(410, "SHARE_INACTIVE", "Share link is not active");
  }

  const ride = await prisma.ride.findUnique({
    where: { id: fresh.rideId },
    include: {
      tariff: true,
      passenger: { select: { id: true, fullName: true } },
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

  const view = attachLastLocation(ride);

  // минимальная приватность для публичного просмотра
  if (view.driver?.driverProfile?.vehicle) {
    view.driver.driverProfile.vehicle = {
      ...view.driver.driverProfile.vehicle,
      plate: maskPlate(view.driver.driverProfile.vehicle.plate)
    };
  }

  res.json({
    ok: true,
    share: { id: fresh.id, status: fresh.status, endsAt: fresh.endsAt },
    ride: view
  });
});
