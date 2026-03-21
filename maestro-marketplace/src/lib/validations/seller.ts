import { z } from "zod";

export const sellerOnboardingSchema = z.object({
  storeName: z.string().min(3).max(80),
  legalName: z.string().min(3).max(120),
  supportEmail: z.email(),
  description: z.string().min(20).max(1000)
});

export const sellerProductSchema = z.object({
  title: z.string().min(4).max(140),
  categoryId: z.string().min(1),
  description: z.string().min(30).max(5000),
  shortDescription: z.string().max(180).optional(),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().min(3).max(80),
  stock: z.number().int().min(0)
});
