// src/controllers/driverLocation.controller.ts
import { Request, Response } from "express";
import { findRideById } from "../models/ride.model";
import {
  upsertDriverLocation,
  getDriverLocationByRideId,
} from "../models/driverLocation.model";

// POST /driver/location (driver -> backend)
export async function updateDriverLocation(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "driver") {
    return res.status(403).json({ success: false, message: "Only driver" });
  }

  const { rideId, lat, lng } = req.body || {};
  if (!rideId || lat == null || lng == null) {
    return res.status(400).json({ success: false, message: "Missing rideId/lat/lng" });
  }

  const ride = findRideById(String(rideId));
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

  // безопасность: водитель может слать только для СВОЕЙ поездки
  if (ride.driverId !== user.userId) {
    return res.status(403).json({ success: false, message: "Ride does not belong to driver" });
  }

  const saved = upsertDriverLocation({
    driverId: user.userId,
    rideId: ride.id,
    lat: Number(lat),
    lng: Number(lng),
  });

  return res.json({ success: true, location: saved });
}

// GET /rides/:id/driver-location (passenger -> backend)
export async function getDriverLocationForRide(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const rideId = req.params.id;
  const ride = findRideById(rideId);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

  // пассажир видит только свою поездку
  if (user.role === "passenger" && ride.passengerId !== user.userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  // водитель — только свою
  if (user.role === "driver" && ride.driverId !== user.userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const location = getDriverLocationByRideId(rideId);
  return res.json({ success: true, location }); // location может быть null
}
