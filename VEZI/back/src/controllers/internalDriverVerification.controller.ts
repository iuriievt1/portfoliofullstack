import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { requiredDriverDocTypes } from "../config/env";

const listSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional()
});

function normType(s: string) {
  return String(s || "").trim().toUpperCase();
}

async function recomputeVerification(tx: any, driverProfileId: string) {
  const profile = await tx.driverProfile.findUnique({
    where: { id: driverProfileId },
    select: { status: true }
  });
  if (!profile) throw new HttpError(404, "DRIVER_PROFILE_NOT_FOUND", "Driver profile not found");

  const docs = await tx.driverDocument.findMany({
    where: { driverId: driverProfileId },
    select: { type: true, status: true }
  });

  const hasPending = docs.some((d: any) => d.status === "PENDING");
  const hasRejected = docs.some((d: any) => d.status === "REJECTED");

  const approvedTypes = new Set(docs.filter((d: any) => d.status === "APPROVED").map((d: any) => normType(d.type)));

  const missingRequired = requiredDriverDocTypes.filter((t) => !approvedTypes.has(normType(t)));

  const verified = missingRequired.length === 0 && !hasPending && !hasRejected;

  // не “разбаниваем” автоматически
  if (profile.status !== "SUSPENDED") {
    await tx.driverProfile.update({
      where: { id: driverProfileId },
      data: { status: verified ? "OFFLINE" : "PENDING_VERIFICATION" }
    });
  }

  return { verified, missingRequired, hasPending, hasRejected };
}

export const listDriverDocumentsInternalHandler = asyncHandler(async (req, res) => {
  const q = listSchema.parse(req.query);
  const status = q.status ?? "PENDING";

  const documents = await prisma.driverDocument.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      driver: {
        include: {
          user: { select: { id: true, fullName: true, phone: true, email: true } },
          vehicle: true
        }
      }
    }
  });

  res.json({ ok: true, documents, requiredDocTypes: requiredDriverDocTypes });
});

const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().min(1).max(500).optional(),
  reviewedBy: z.string().min(1).max(80).optional()
});

export const decideDriverDocumentInternalHandler = asyncHandler(async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const body = decisionSchema.parse(req.body);

  const result = await prisma.$transaction(async (tx) => {
    const doc = await tx.driverDocument.findUnique({ where: { id } });
    if (!doc) throw new HttpError(404, "DOC_NOT_FOUND", "Document not found");

    const now = new Date();

    const newDoc = await tx.driverDocument.update({
      where: { id },
      data: {
        status: body.decision,
        reviewedAt: now,
        reviewedBy: body.reviewedBy ?? "internal",
        reviewNote: body.note ?? null
      }
    });

    const verification = await recomputeVerification(tx, doc.driverId);

    return { newDoc, verification };
  });

  res.json({ ok: true, document: result.newDoc, verification: result.verification });
});
