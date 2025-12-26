// src/controllers/rides.controller.ts
import { Request, Response } from "express";
import {
  createRide,
  findRideById,
  findRidesForPassenger,
  findActiveRideForPassenger,
  cancelRideById,
  moveRideToNextStatus,
} from "../models/ride.model";

// POST /rides/request
export async function requestRide(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "passenger") {
    return res.status(403).json({ success: false, message: "Only passenger can request ride" });
  }

  const {
    pickupAddress,
    pickupLat,
    pickupLng,
    destinationAddress,
    destinationLat,
    destinationLng,
    carType,
  } = req.body || {};

  if (
    !pickupAddress ||
    pickupLat == null ||
    pickupLng == null ||
    !destinationAddress ||
    destinationLat == null ||
    destinationLng == null
  ) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  const ride = createRide({
    passengerId: user.userId,
    pickupAddress,
    pickupLat: Number(pickupLat),
    pickupLng: Number(pickupLng),
    destinationAddress,
    destinationLat: Number(destinationLat),
    destinationLng: Number(destinationLng),
    carType,
  });

  return res.status(201).json({ success: true, ride });
}

// GET /rides/:id
export async function getRideById(req: Request, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const ride = findRideById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

  if (user.role === "passenger" && ride.passengerId !== user.userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  return res.json({ success: true, ride });
}

// GET /rides/passenger/active
export async function getActiveRideForPassengerHandler(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "passenger") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const ride = findActiveRideForPassenger(user.userId);
  return res.json({ success: true, ride: ride ?? null });
}

// POST /rides/:id/cancel
export async function cancelRide(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "passenger") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const ride = cancelRideById(req.params.id, user.userId);
  if (!ride) {
    return res.status(400).json({ success: false, message: "Cannot cancel ride" });
  }

  return res.json({ success: true, ride });
}

// GET /rides/passenger
export async function getPassengerRides(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "passenger") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const rides = findRidesForPassenger(user.userId);
  return res.json({ success: true, rides });
}

// POST /rides/:id/next-status (DEV)
export async function moveRideToNextStatusHandler(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "passenger") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const ride = findRideById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

  if (ride.passengerId !== user.userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const updated = moveRideToNextStatus(req.params.id);
  if (!updated) return res.status(400).json({ success: false, message: "Cannot move status" });

  return res.json({ success: true, ride: updated });
}
