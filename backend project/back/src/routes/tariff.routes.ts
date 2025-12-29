import { Router } from "express";
import { listTariffsHandler } from "../controllers/tariff.controller";

export const tariffRoutes = Router();

tariffRoutes.get("/", listTariffsHandler);

