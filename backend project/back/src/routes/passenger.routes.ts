import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { createRideHandler, getActiveRideHandler, listRidesHandler, cancelRideHandler } from "../controllers/passenger.controller";
import { estimateRideHandler, loyaltyStatusHandler } from "../controllers/passenger.controller";


export const passengerRoutes = Router();

passengerRoutes.use(requireAuth, requireRole("PASSENGER"));

passengerRoutes.post("/rides", createRideHandler);
passengerRoutes.get("/rides/active", getActiveRideHandler);
passengerRoutes.get("/rides", listRidesHandler);
passengerRoutes.post("/rides/:id/cancel", cancelRideHandler);
passengerRoutes.post("/rides/estimate", estimateRideHandler);
passengerRoutes.get("/loyalty", loyaltyStatusHandler);

