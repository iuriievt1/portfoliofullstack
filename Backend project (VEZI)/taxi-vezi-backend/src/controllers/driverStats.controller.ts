// src/controllers/driverStats.controller.ts

import { Request, Response } from "express";
import { findCompletedRidesForDriver } from "../models/ride.model";

export async function getDriverStats(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "driver") {
    return res.status(403).json({ success: false, message: "Only driver" });
  }

  const rides = findCompletedRidesForDriver(user.userId);

  const totalTrips = rides.length;

  // пока фейковый расчет (позже заменим на real pricing)
  const totalEarnings = totalTrips * 200;

  return res.json({
    success: true,
    totalTrips,
    totalEarnings,
    rides,
  });
}
