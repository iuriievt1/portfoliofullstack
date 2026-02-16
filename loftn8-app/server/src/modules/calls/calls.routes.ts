import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { guestSessionAuth } from "../../middleware/auth/guestSession";
import { notifyCallCreated } from "../staff/push.service";

export const callsRouter = Router();

const CreateCallSchema = z.object({
  type: z.enum(["WAITER", "HOOKAH", "BILL", "HELP"]),
  message: z.string().max(500).optional(),
});

callsRouter.post(
  "/",
  guestSessionAuth,
  validate(CreateCallSchema),
  asyncHandler(async (req, res) => {
    const session = req.guestSession!;
    const body = req.body as z.infer<typeof CreateCallSchema>;

    const call = await prisma.staffCall.create({
      data: {
        sessionId: session.id,
        tableId: session.tableId,
        type: body.type,
        message: body.message,
      },
    });

    // ✅ PUSH
    try {
      await notifyCallCreated(call.id);
    } catch (e) {
      console.warn("push notifyCallCreated failed", e);
    }

    res.json({ ok: true, call });
  })
);
