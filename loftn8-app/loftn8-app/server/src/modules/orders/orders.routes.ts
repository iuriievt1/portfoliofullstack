import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { guestSessionAuth } from "../../middleware/auth/guestSession";
import { HttpError } from "../../utils/httpError";
import { notifyOrderCreated } from "../staff/push.service";

export const ordersRouter = Router();

const CreateOrderSchema = z.object({
  comment: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        qty: z.number().int().min(1).max(50),
        comment: z.string().max(300).optional(),
      })
    )
    .min(1),
});

ordersRouter.post(
  "/",
  guestSessionAuth,
  validate(CreateOrderSchema),
  asyncHandler(async (req, res) => {
    const session = req.guestSession!;
    const user = req.user;

    const body = req.body as z.infer<typeof CreateOrderSchema>;
    const menuItemIds = body.items.map((i) => i.menuItemId);

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isActive: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new HttpError(400, "MENU_ITEM_INVALID", "Some menu items are invalid/inactive");
    }

    const priceMap = new Map(menuItems.map((m) => [m.id, m.priceCzk]));

    const order = await prisma.order.create({
      data: {
        sessionId: session.id,
        tableId: session.tableId,
        userId: user?.id ?? null,
        comment: body.comment,
        items: {
          create: body.items.map((it) => ({
            menuItemId: it.menuItemId,
            qty: it.qty,
            comment: it.comment,
            priceCzk: priceMap.get(it.menuItemId)!,
          })),
        },
      },
      include: { items: true },
    });

    // ✅ PUSH (не ломаем создание заказа, если пуш упал)
    try {
      await notifyOrderCreated(order.id);
    } catch (e) {
      console.warn("push notifyOrderCreated failed", e);
    }

    res.json({ ok: true, order });
  })
);

ordersRouter.get(
  "/current",
  guestSessionAuth,
  asyncHandler(async (req, res) => {
    const session = req.guestSession!;
    const orders = await prisma.order.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.json({ ok: true, orders });
  })
);
