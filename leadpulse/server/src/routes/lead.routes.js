import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireOrgRole } from "../middlewares/auth.js";
import { Lead } from "../models/lead.model.js";
import { logActivity } from "../services/activity.js";
import { emitOrgEvent } from "../services/realtimeBus.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireOrgRole("owner", "admin", "member"));

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().max(60).optional(),
    company: z.string().max(120).optional(),
    message: z.string().max(2000).optional(),
    stage: z.enum(["new","contacted","qualified","proposal","won","lost"]).optional(),
    value: z.number().nonnegative().optional(),
    tags: z.array(z.string().min(1).max(32)).optional()
  })
});

router.get("/", asyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  const leads = await Lead.find({ org: orgId }).sort({ updatedAt: -1 }).lean();
  res.json({ leads: leads.map(serializeLead) });
}));

router.post("/", validate(createSchema), asyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  const data = req.validated.body;

  const lead = await Lead.create({
    org: orgId,
    source: "manual",
    ...data,
    lastTouchedAt: new Date()
  });

  await logActivity({
    orgId,
    actorId: req.user.id,
    type: "lead.created",
    message: `Created lead: ${lead.name}`,
    meta: { leadId: lead._id.toString() }
  });

  emitOrgEvent(orgId, "lead.created", { leadId: lead._id.toString() });
  req.app?.locals?.io?.to(`org:${orgId}`).emit("lead.created", { leadId: lead._id.toString() });

  res.json({ lead: serializeLead(lead) });
}));

const updateSchema = z.object({
  body: z.object({
    stage: z.enum(["new","contacted","qualified","proposal","won","lost"]).optional(),
    name: z.string().min(1).max(120).optional(),
    email: z.string().email().optional().or(z.literal("")).optional(),
    phone: z.string().max(60).optional(),
    company: z.string().max(120).optional(),
    message: z.string().max(2000).optional(),
    value: z.number().nonnegative().optional(),
    tags: z.array(z.string().min(1).max(32)).optional()
  })
});

router.patch("/:leadId", validate(updateSchema), asyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  const { leadId } = req.params;
  const patch = req.validated.body;

  const lead = await Lead.findOne({ _id: leadId, org: orgId });
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const prevStage = lead.stage;

  Object.assign(lead, patch);
  lead.lastTouchedAt = new Date();
  await lead.save();

  if (patch.stage && patch.stage !== prevStage) {
    await logActivity({
      orgId,
      actorId: req.user.id,
      type: "lead.moved",
      message: `Moved lead "${lead.name}" from ${prevStage} → ${lead.stage}`,
      meta: { leadId: lead._id.toString(), from: prevStage, to: lead.stage }
    });
  } else {
    await logActivity({
      orgId,
      actorId: req.user.id,
      type: "lead.updated",
      message: `Updated lead: ${lead.name}`,
      meta: { leadId: lead._id.toString() }
    });
  }

  emitOrgEvent(orgId, "lead.updated", { leadId: lead._id.toString() });
  req.app?.locals?.io?.to(`org:${orgId}`).emit("lead.updated", { leadId: lead._id.toString() });

  res.json({ lead: serializeLead(lead) });
}));

const noteSchema = z.object({
  body: z.object({
    body: z.string().min(1).max(2000)
  })
});

router.post("/:leadId/notes", validate(noteSchema), asyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  const { leadId } = req.params;

  const lead = await Lead.findOne({ _id: leadId, org: orgId });
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  lead.notes.unshift({ body: req.validated.body.body, createdBy: req.user.id });
  lead.lastTouchedAt = new Date();
  await lead.save();

  await logActivity({
    orgId,
    actorId: req.user.id,
    type: "lead.note",
    message: `Added note to: ${lead.name}`,
    meta: { leadId: lead._id.toString() }
  });

  emitOrgEvent(orgId, "lead.updated", { leadId: lead._id.toString() });
  req.app?.locals?.io?.to(`org:${orgId}`).emit("lead.updated", { leadId: lead._id.toString() });

  res.json({ lead: serializeLead(lead) });
}));

function serializeLead(l) {
  const lead = l.toObject ? l.toObject() : l;
  return {
    id: lead._id.toString(),
    orgId: lead.org.toString(),
    stage: lead.stage,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    message: lead.message,
    value: lead.value,
    tags: lead.tags,
    notes: (lead.notes || []).map((n) => ({
      id: n._id.toString(),
      body: n.body,
      createdBy: n.createdBy.toString(),
      createdAt: n.createdAt
    })),
    lastTouchedAt: lead.lastTouchedAt,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt
  };
}

export default router;
