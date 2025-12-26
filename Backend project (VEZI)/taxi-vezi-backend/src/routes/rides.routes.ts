// src/routes/rides.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  requestRide,
  getRideById,
  getActiveRideForPassengerHandler,
  cancelRide,
  getPassengerRides,
  moveRideToNextStatusHandler,
} from "../controllers/rides.controller";
import { getDriverLocationForRide } from "../controllers/driverLocation.controller";

const router = Router();

router.post("/request", requireAuth, requestRide);

router.get("/passenger/active", requireAuth, getActiveRideForPassengerHandler);
router.get("/passenger", requireAuth, getPassengerRides);

router.post("/:id/next-status", requireAuth, moveRideToNextStatusHandler);
router.post("/:id/cancel", requireAuth, cancelRide);

router.get("/:id/driver-location", requireAuth, getDriverLocationForRide);
router.get("/:id", requireAuth, getRideById);

export default router;
