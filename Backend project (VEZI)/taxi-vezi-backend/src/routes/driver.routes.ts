// src/routes/driver.routes.ts

import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  getAvailableRidesForDriver,
  getActiveRideForDriverHandler,
  acceptRideHandler,
  moveRideToNextStatusByDriverHandler,
} from "../controllers/driverRides.controller";
import { getDriverStats } from "../controllers/driverStats.controller";
import { updateDriverLocation } from "../controllers/driverLocation.controller";

const router = Router();

router.get("/rides/available", requireAuth, getAvailableRidesForDriver);
router.get("/rides/active", requireAuth, getActiveRideForDriverHandler);
router.post("/rides/:id/accept", requireAuth, acceptRideHandler);
router.post("/rides/:id/next-status", requireAuth, moveRideToNextStatusByDriverHandler);
router.post("/location", requireAuth, updateDriverLocation);

// 💰 НОВОЕ
router.get("/stats", requireAuth, getDriverStats);


export default router;
