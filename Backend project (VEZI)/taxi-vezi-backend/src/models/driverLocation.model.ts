// src/models/driverLocation.model.ts

type DriverLocation = {
  driverId: string;
  rideId: string;
  lat: number;
  lng: number;
  updatedAt: string;
};

const driverLocations: Record<string, DriverLocation> = {}; // key = rideId

export function upsertDriverLocation(params: {
  driverId: string;
  rideId: string;
  lat: number;
  lng: number;
}) {
  driverLocations[params.rideId] = {
    driverId: params.driverId,
    rideId: params.rideId,
    lat: params.lat,
    lng: params.lng,
    updatedAt: new Date().toISOString(),
  };
  return driverLocations[params.rideId];
}

export function getDriverLocationByRideId(rideId: string) {
  return driverLocations[rideId] ?? null;
}

export function removeDriverLocationByRideId(rideId: string) {
  delete driverLocations[rideId];
}
