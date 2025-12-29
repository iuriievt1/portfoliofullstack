import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getRideHandler, postMessageHandler } from "../controllers/ride.controller";

export const rideRoutes = Router();

rideRoutes.use(requireAuth);

rideRoutes.get("/:id", getRideHandler);
rideRoutes.post("/message", postMessageHandler);
