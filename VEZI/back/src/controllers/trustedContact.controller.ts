import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

const contactSchema = z
  .object({
    name: z.string().min(1).max(80),
    phone: z.string().min(3).max(30).optional(),
    email: z.string().email().optional()
  })
  .refine((d) => Boolean(d.phone || d.email), { message: "phone or email required" });

export const listTrustedContactsHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const contacts = await prisma.trustedContact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  res.json({ ok: true, contacts });
});

export const createTrustedContactHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const body = contactSchema.parse(req.body);

  const created = await prisma.trustedContact.create({
    data: {
      userId,
      name: body.name,
      phone: body.phone ?? null,
      email: body.email ?? null
    }
  });

  res.json({ ok: true, contact: created });
});

export const deleteTrustedContactHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const id = z.string().min(1).parse(req.params.id);

  const existing = await prisma.trustedContact.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "CONTACT_NOT_FOUND", "Contact not found");
  if (existing.userId !== userId) throw new HttpError(403, "FORBIDDEN", "Not your contact");

  await prisma.trustedContact.delete({ where: { id } });

  res.json({ ok: true });
});
