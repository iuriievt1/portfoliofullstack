import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Org } from "../models/org.model.js";
import { Membership } from "../models/membership.model.js";
import { requireAuth, requireOrgRole } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const memberships = await Membership.find({ user: req.user.id }).populate("org").lean();
  const orgs = memberships.map((m) => ({
    id: m.org._id.toString(),
    name: m.org.name,
    role: m.role,
    publicKey: m.org.publicKey
  }));
  res.json({ orgs });
}));

const createOrgSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120)
  })
});

router.post("/", validate(createOrgSchema), asyncHandler(async (req, res) => {
  const { name } = req.validated.body;
  const publicKey = `lp_${nanoid(16)}`;

  const org = await Org.create({ name, publicKey });
  await Membership.create({ org: org._id, user: req.user.id, role: "owner" });

  res.json({ org: { id: org._id.toString(), name: org.name, publicKey: org.publicKey, role: "owner" } });
}));

// Settings endpoint: verify role
router.get("/:orgId/settings", requireOrgRole("owner", "admin", "member"), asyncHandler(async (req, res) => {
  const org = await Org.findById(req.params.orgId).lean();
  res.json({ org: { id: org._id.toString(), name: org.name, publicKey: org.publicKey, role: req.membership.role } });
}));

export default router;
