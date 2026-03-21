import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

async function getDriverProfileOrThrow(userId: string) {
  const profile = await prisma.driverProfile.findUnique({ where: { userId } });
  if (!profile) throw new HttpError(404, "DRIVER_PROFILE_NOT_FOUND", "Driver profile not found");
  return profile;
}

const upsertDocSchema = z.object({
  type: z.string().min(2).max(40),           // DRIVER_LICENSE, ID, VEHICLEREG
  number: z.string().min(2).max(80),
  expiryDate: z.string().datetime().optional(), // ISO string
  files: z.any().optional()                   // Json (array/object) — позже
});

export const listMyDriverDocumentsHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "DRIVER") throw new HttpError(403, "FORBIDDEN", "Driver only");

  const profile = await getDriverProfileOrThrow(user.id);

  const documents = await prisma.driverDocument.findMany({
    where: { driverId: profile.id },
    orderBy: { createdAt: "desc" }
  });

  res.json({ ok: true, documents });
});

export const createDriverDocumentHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "DRIVER") throw new HttpError(403, "FORBIDDEN", "Driver only");

  const profile = await getDriverProfileOrThrow(user.id);
  const body = upsertDocSchema.parse(req.body);

  const doc = await prisma.driverDocument.create({
    data: {
      driverId: profile.id,
      type: body.type,
      number: body.number,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      status: "PENDING",
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: null,
      files: body.files ?? []
    }
  });

  res.json({ ok: true, document: doc });
});

export const resubmitDriverDocumentHandler = asyncHandler(async (req, res) => {
  const user = req.user!;
  if (user.role !== "DRIVER") throw new HttpError(403, "FORBIDDEN", "Driver only");

  const profile = await getDriverProfileOrThrow(user.id);
  const id = z.string().min(1).parse(req.params.id);
  const body = upsertDocSchema.parse(req.body);

  const existing = await prisma.driverDocument.findUnique({ where: { id } });
  if (!existing || existing.driverId !== profile.id) {
    throw new HttpError(404, "DOC_NOT_FOUND", "Document not found");
  }

  const doc = await prisma.driverDocument.update({
    where: { id },
    data: {
      type: body.type,
      number: body.number,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      files: body.files ?? [],
      status: "PENDING",
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: null
    }
  });

  res.json({ ok: true, document: doc });
});
