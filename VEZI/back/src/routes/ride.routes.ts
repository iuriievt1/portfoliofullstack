import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  getRideHandler,
  postMessageHandler,
  getMyActiveRideHandler,
  listMyRidesHandler,
  cancelRideUnifiedHandler,
  updateRideStatusDriverHandler,
  postRideLocationHandler,
  noShowRideHandler
} from "../controllers/ride.controller";

export const rideRoutes = Router();

rideRoutes.use(requireAuth);

// общие
rideRoutes.get("/active", getMyActiveRideHandler);
rideRoutes.get("/", listMyRidesHandler);
rideRoutes.post("/message", postMessageHandler);
rideRoutes.post("/:id/cancel", cancelRideUnifiedHandler);

// driver-only ride actions
rideRoutes.post("/:id/status", requireRole("DRIVER"), updateRideStatusDriverHandler);
rideRoutes.post("/:id/location", requireRole("DRIVER"), postRideLocationHandler);
rideRoutes.post("/:id/no-show", requireRole("DRIVER"), noShowRideHandler);

// details
rideRoutes.get("/:id", getRideHandler);
