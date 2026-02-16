import { Router } from "express";
import { prisma } from "../../db/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

export const menuRouter = Router();

// V1: один venue (pilot). Берём меню по venue.slug = "pilot"
menuRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const venue = await prisma.venue.findUnique({ where: { slug: "pilot" } });
    if (!venue) return res.status(404).json({ error: "VENUE_NOT_FOUND" });

    const categories = await prisma.menuCategory.findMany({
      where: { venueId: venue.id },
      // ✅ сначала секции (DISHES/DRINKS/HOOKAH), потом порядок внутри секции
      orderBy: [{ section: "asc" }, { sort: "asc" }],
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sort: "asc" },
        },
      },
    });

    res.json({
      venue: { id: venue.id, name: venue.name, slug: venue.slug },
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        sort: c.sort,
        section: c.section, // ✅ NEW
        items: c.items.map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          priceCzk: i.priceCzk,
        })),
      })),
    });
  })
);
