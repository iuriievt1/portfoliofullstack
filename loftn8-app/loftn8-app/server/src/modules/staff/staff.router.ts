import { Router } from "express";
import { staffAuthRouter } from "./staffAuth.routes";
import { staffDashboardRouter } from "./staffDashboard.routes";
import { staffPushRouter } from "./push.routes";

export const staffRouter = Router();

staffRouter.use("/auth", staffAuthRouter);
staffRouter.use("/dashboard", staffDashboardRouter);
staffRouter.use("/push", staffPushRouter);
