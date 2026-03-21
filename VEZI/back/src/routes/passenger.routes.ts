import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  createRideHandler,
  estimateRideHandler,
  loyaltyStatusHandler
} from "../controllers/passenger.controller";

export const passengerRoutes = Router();

passengerRoutes.use(requireAuth, requireRole("PASSENGER"));

// только passenger-specific
passengerRoutes.post("/rides", createRideHandler);
passengerRoutes.post("/rides/estimate", estimateRideHandler);
passengerRoutes.get("/loyalty", loyaltyStatusHandler);
