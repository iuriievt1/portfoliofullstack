import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/prisma";

export const listTariffsHandler = asyncHandler(async (_req, res) => {
  const tariffs = await prisma.tariff.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" }
  });

  res.json({ ok: true, tariffs });
});

