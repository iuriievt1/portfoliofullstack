import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const getWalletSummaryHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const totals = await prisma.walletEntry.aggregate({
    where: { userId },
    _sum: { amountCents: true }
  });

  const byType = await prisma.walletEntry.groupBy({
    by: ["type"],
    where: { userId },
    _sum: { amountCents: true }
  });

  const byCurrency = await prisma.walletEntry.groupBy({
    by: ["currency"],
    where: { userId },
    _sum: { amountCents: true }
  });

  res.json({
    ok: true,
    summary: {
      balanceCents: totals._sum.amountCents ?? 0,
      byType: Object.fromEntries(byType.map((r) => [r.type, r._sum.amountCents ?? 0])),
      byCurrency: Object.fromEntries(byCurrency.map((r) => [r.currency, r._sum.amountCents ?? 0]))
    }
  });
});

const listSchema = z.object({
  take: z.coerce.number().min(1).max(100).optional(),
  cursor: z.string().min(1).optional()
});

export const listWalletEntriesHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const q = listSchema.parse(req.query);

  const take = q.take ?? 50;

  const entries = await prisma.walletEntry.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {})
  });

  const nextCursor = entries.length === take ? entries[entries.length - 1].id : null;

  res.json({ ok: true, entries, nextCursor });
});
