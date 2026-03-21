import { Router } from "express";
import { getPublicSharedRideHandler } from "../controllers/publicShare.controller";

export const publicRoutes = Router();

publicRoutes.get("/share/:token", getPublicSharedRideHandler);
