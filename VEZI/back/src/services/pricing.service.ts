import { prisma } from "../config/prisma";
import { HttpError } from "../utils/httpError";

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function estimatePriceCents(params: {
  tariffId: string;
  pickupLat: number;
  pickupLng: number;
  destinationLat: number;
  destinationLng: number;
  distanceMeters?: number;
  durationSeconds?: number;
}) {
  const tariff = await prisma.tariff.findUnique({ where: { id: params.tariffId } });
  if (!tariff || !tariff.isActive) throw new HttpError(400, "TARIFF_INVALID", "Tariff not found or inactive");

  const distanceMeters =
    typeof params.distanceMeters === "number" && params.distanceMeters > 0
      ? params.distanceMeters
      : haversineMeters(params.pickupLat, params.pickupLng, params.destinationLat, params.destinationLng);

  const durationSeconds =
    typeof params.durationSeconds === "number" && params.durationSeconds > 0
      ? params.durationSeconds
      : Math.max(120, Math.round((distanceMeters / 1000) / 26 * 3600));

  const km = distanceMeters / 1000;
  const minutes = durationSeconds / 60;

  const raw =
    tariff.baseFareCents +
    Math.round(km * tariff.perKmCents) +
    Math.round(minutes * tariff.perMinCents);

  const final = Math.max(raw, tariff.minFareCents);

  return {
    currency: tariff.currency,
    distanceMeters: Math.round(distanceMeters),
    durationSeconds: Math.round(durationSeconds),
    priceEstimatedCents: final
  };
}
