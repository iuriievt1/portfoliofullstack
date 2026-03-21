import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

const createTicketSchema = z.object({
  rideId: z.string().min(1).optional(),
  category: z.string().min(2).max(50),
  message: z.string().min(2).max(2000).optional(),
  meta: z.any().optional()
});

export const createSupportTicketHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const body = createTicketSchema.parse(req.body);

  if (body.rideId) {
    const ride = await prisma.ride.findUnique({
      where: { id: body.rideId },
      select: { passengerId: true, driverId: true }
    });
    if (!ride) throw new HttpError(404, "RIDE_NOT_FOUND", "Ride not found");
    if (ride.passengerId !== user.id && ride.driverId !== user.id) {
      throw new HttpError(403, "FORBIDDEN", "Not your ride");
    }
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      rideId: body.rideId ?? null,
      category: body.category,
      status: "OPEN",
      meta: {
        v: 1,
        message: body.message ?? null,
        extra: body.meta ?? {}
      }
    }
  });

  res.json({ ok: true, ticket });
});

export const listMySupportTicketsHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  res.json({ ok: true, tickets });
});

export const getMySupportTicketHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  const id = z.string().min(1).parse(req.params.id);

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) throw new HttpError(404, "TICKET_NOT_FOUND", "Ticket not found");
  if (ticket.userId !== user.id) throw new HttpError(403, "FORBIDDEN", "Not your ticket");

  res.json({ ok: true, ticket });
});

/* INTERNAL (backoffice) базовый минимум*/
export const internalListTicketsHandler = asyncHandler(async (req, res) => {
  const status = z.string().optional().parse(req.query.status);
  const where = status ? { status } : { status: { in: ["OPEN", "IN_PROGRESS"] } };

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200
  });

  res.json({ ok: true, tickets });
});

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  note: z.string().min(1).max(2000).optional()
});

export const internalUpdateTicketStatusHandler = asyncHandler(async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateStatusSchema.parse(req.body);

  const updated = await prisma.$transaction(async (tx) => {
    const t = await tx.supportTicket.findUnique({ where: { id } });
    if (!t) throw new HttpError(404, "TICKET_NOT_FOUND", "Ticket not found");

    const meta = (t.meta as any) ?? {};
    const history = Array.isArray(meta.history) ? meta.history : [];

    if (body.note) {
      history.push({ at: new Date().toISOString(), note: body.note });
    }

    return tx.supportTicket.update({
      where: { id },
      data: {
        status: body.status,
        meta: { ...meta, history }
      }
    });
  });

  res.json({ ok: true, ticket: updated });
});
