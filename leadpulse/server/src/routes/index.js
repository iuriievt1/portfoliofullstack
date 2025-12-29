import { Router } from "express";
import authRoutes from "./auth.routes.js";
import orgRoutes from "./org.routes.js";
import leadRoutes from "./lead.routes.js";
import activityRoutes from "./activity.routes.js";
import publicRoutes from "./public.routes.js";
import metricsRoutes from "./metrics.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

router.use("/auth", authRoutes);
router.use("/orgs", orgRoutes);
router.use("/orgs/:orgId/leads", leadRoutes);
router.use("/orgs/:orgId/activity", activityRoutes);

router.use("/public", publicRoutes);
router.use("/metrics", metricsRoutes);

export default router;
