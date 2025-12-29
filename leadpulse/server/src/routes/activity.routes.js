import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireOrgRole } from "../middlewares/auth.js";
import { Activity } from "../models/activity.model.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireOrgRole("owner", "admin", "member"));

router.get("/", asyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  const items = await Activity.find({ org: orgId }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({
    activity: items.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      message: a.message,
      meta: a.meta,
      createdAt: a.createdAt
    }))
  });
}));

export default router;
