import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireOrgRole } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Lead } from "../models/lead.model.js";
import { realtimeBus } from "../services/realtimeBus.js";

const router = Router();

// We also require org membership (prevents leaking org metrics by orgId guessing)
router.get("/stream", requireAuth, requireOrgRole("owner", "admin", "member"), asyncHandler(async (req, res) => {
  const orgId = req.query.orgId || req.params.orgId || req.body.orgId;

  // requireOrgRole already validated membership using orgId from query/body/params
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = async () => {
    const countsAgg = await Lead.aggregate([
      { $match: { org: new mongoose.Types.ObjectId(orgId) } },
      { $group: { _id: "$stage", count: { $sum: 1 } } }
    ]);

    const counts = Object.fromEntries(countsAgg.map((x) => [x._id, x.count]));
    const payload = { ts: Date.now(), counts };

    res.write(`event: metrics\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  await send();

  const handler = () => { send().catch(() => {}); };
  realtimeBus.on(`org:${orgId}:lead.created`, handler);
  realtimeBus.on(`org:${orgId}:lead.updated`, handler);

  const keepAlive = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: {}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    realtimeBus.off(`org:${orgId}:lead.created`, handler);
    realtimeBus.off(`org:${orgId}:lead.updated`, handler);
  });
}));

export default router;
