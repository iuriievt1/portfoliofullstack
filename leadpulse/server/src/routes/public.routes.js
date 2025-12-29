import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Org } from "../models/org.model.js";
import { Lead } from "../models/lead.model.js";
import { Membership } from "../models/membership.model.js";
import { sendLeadNotification } from "../services/email.js";
import { logActivity } from "../services/activity.js";
import { emitOrgEvent } from "../services/realtimeBus.js";

const router = Router();

const publicLeadSchema = z.object({
  body: z.object({
    publicKey: z.string().min(5),
    name: z.string().min(1).max(120),
    email: z.string().email().optional().or(z.literal("")),
    message: z.string().max(2000).optional(),
    company: z.string().max(120).optional(),
    phone: z.string().max(60).optional()
  })
});

router.post("/lead", validate(publicLeadSchema), asyncHandler(async (req, res) => {
  const { publicKey, ...data } = req.validated.body;

  const org = await Org.findOne({ publicKey }).lean();
  if (!org) return res.status(404).json({ error: "Invalid publicKey" });

  const lead = await Lead.create({
    org: org._id,
    source: "public-form",
    stage: "new",
    ...data,
    lastTouchedAt: new Date()
  });

  const ownerMembership = await Membership
    .findOne({ org: org._id, role: { $in: ["owner", "admin"] } })
    .populate("user")
    .lean();

  const actorId = ownerMembership?.user?._id?.toString();
  const to = ownerMembership?.user?.email;

  if (actorId) {
    await logActivity({
      orgId: org._id.toString(),
      actorId,
      type: "lead.captured",
      message: `Captured lead via public form: ${lead.name}`,
      meta: { leadId: lead._id.toString(), source: "public-form" }
    });
  }

  emitOrgEvent(org._id.toString(), "lead.created", { leadId: lead._id.toString() });
  req.app?.locals?.io?.to(`org:${org._id.toString()}`).emit("lead.created", { leadId: lead._id.toString() });

  if (to) {
    await sendLeadNotification({ to, orgName: org.name, lead });
  }

  res.json({ ok: true, leadId: lead._id.toString() });
}));

export default router;
