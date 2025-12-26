// src/controllers/driverRides.controller.ts
import { Request, Response } from "express";
import {
  findAvailableRidesForDriver,
  findActiveRideForDriver,
  acceptRideByDriver,
  moveRideToNextStatusByDriver,
  findRideById,
} from "../models/ride.model";

// GET /driver/rides/available
export async function getAvailableRidesForDriver(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "driver") {
    return res.status(403).json({ success: false, message: "Only driver can view available rides" });
  }

  const rides = findAvailableRidesForDriver();
  return res.json({ success: true, rides });
}

// GET /driver/rides/active
export async function getActiveRideForDriverHandler(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "driver") {
    return res.status(403).json({ success: false, message: "Only driver can view active ride" });
  }

  const ride = findActiveRideForDriver(user.userId);
  return res.json({ success: true, ride: ride ?? null });
}

// POST /driver/rides/:id/accept
export async function acceptRideHandler(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "driver") {
    return res.status(403).json({ success: false, message: "Only driver can accept ride" });
  }

  const { id } = req.params;

  const active = findActiveRideForDriver(user.userId);
  if (active) {
    return res.status(400).json({ success: false, message: "Driver already has active ride" });
  }

  const ride = acceptRideByDriver(id, user.userId);
  if (!ride) {
    return res.status(400).json({ success: false, message: "Cannot accept ride (maybe already taken)" });
  }

  return res.json({ success: true, ride });
}

// POST /driver/rides/:id/next-status
export async function moveRideToNextStatusByDriverHandler(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "driver") {
    return res.status(403).json({ success: false, message: "Only driver can change ride status" });
  }

  const { id } = req.params;

  const ride = findRideById(id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });

  if (ride.driverId !== user.userId) {
    return res.status(403).json({ success: false, message: "Ride does not belong to this driver" });
  }

  const updated = moveRideToNextStatusByDriver(id, user.userId);
  if (!updated) return res.status(400).json({ success: false, message: "Cannot move to next status" });

  return res.json({ success: true, ride: updated });
}
