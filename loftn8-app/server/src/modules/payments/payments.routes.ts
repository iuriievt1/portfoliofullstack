import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { guestSessionAuth } from "../../middleware/auth/guestSession";
import { notifyPaymentRequested } from "../staff/push.service";

export const paymentsRouter = Router();

const RequestPaymentSchema = z.object({
  method: z.enum(["CARD", "CASH"]),
});

paymentsRouter.post(
  "/request",
  guestSessionAuth,
  validate(RequestPaymentSchema),
  asyncHandler(async (req, res) => {
    const session = req.guestSession!;
    const body = req.body as z.infer<typeof RequestPaymentSchema>;

    const payment = await prisma.paymentRequest.create({
      data: {
        sessionId: session.id,
        tableId: session.tableId,
        method: body.method,
      },
    });

    // ✅ PUSH
    try {
      await notifyPaymentRequested(payment.id);
    } catch (e) {
      console.warn("push notifyPaymentRequested failed", e);
    }

    res.json({ ok: true, payment });
  })
);
