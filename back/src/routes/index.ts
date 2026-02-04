import { Router } from "express";
import { healthRoutes } from "./health.routes";
import { authRoutes } from "./auth.routes";
import { passengerRoutes } from "./passenger.routes";
import { driverRoutes } from "./driver.routes";
import { rideRoutes } from "./ride.routes";
import { tariffRoutes } from "./tariff.routes";
import { safetyRoutes } from "./safety.routes";
import { walletRoutes } from "./wallet.routes";
import { publicRoutes } from "./public.routes";
import { supportRoutes } from "./support.routes";
import { internalRoutes } from "./internal.routes";
import { paymentRoutes } from "./payment.routes";








export const routes = Router();

routes.use("/health", healthRoutes);
routes.use("/auth", authRoutes);
routes.use("/passenger", passengerRoutes);
routes.use("/driver", driverRoutes);
routes.use("/rides", rideRoutes);
routes.use("/tariffs", tariffRoutes);
routes.use("/safety", safetyRoutes);
routes.use("/wallet", walletRoutes);
routes.use("/public", publicRoutes);
routes.use("/support", supportRoutes);
routes.use("/internal", internalRoutes);
routes.use("/payments", paymentRoutes);







