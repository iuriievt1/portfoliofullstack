import { cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/cache";
import { serializeForClient, toNumber } from "@/lib/utils";

type ProductQueryInput = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  rating?: string;
  sort?: string;
};

export async function getMarketplaceStats() {
  "use cache";
  cacheLife("hours");

  const [products, sellers, categories] = await Promise.all([
    db.product.count({ where: { status: "ACTIVE" } }),
    db.sellerProfile.count({ where: { status: "ACTIVE" } }),
    db.category.count()
  ]);

  return { products, sellers, categories };
}

export async function getHeaderCategories() {
  "use cache";
  cacheLife("hours");

  return db.category.findMany({
    orderBy: { name: "asc" },
    take: 8
  });
}

export async function getFeaturedProducts() {
  "use cache";
  cacheLife("minutes");

  const products = await db.product.findMany({
    where: { status: "ACTIVE", featured: true },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      seller: true,
      category: true,
      variants: { orderBy: { price: "asc" }, take: 1 }
    }
  });

  return serializeForClient(products);
}

export async function getActivePromotions() {
  "use cache";
  cacheLife("minutes");

  const promotions = await db.promotion.findMany({
    where: {
      isActive: true,
      startsAt: { lte: new Date() },
      endsAt: { gte: new Date() }
    },
    orderBy: { startsAt: "desc" },
    take: 3
  });

  return serializeForClient(promotions);
}

export async function getProducts(input: ProductQueryInput = {}) {
  const where = {
    status: "ACTIVE" as const,
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" as const } },
            { description: { contains: input.q, mode: "insensitive" as const } },
            { searchKeywords: { has: input.q.toLowerCase() } }
          ]
        }
      : {}),
    ...(input.category ? { category: { slug: input.category } } : {}),
    ...(input.rating ? { averageRating: { gte: toNumber(input.rating) } } : {}),
    ...(input.min || input.max
      ? {
          basePrice: {
            ...(input.min ? { gte: toNumber(input.min) } : {}),
            ...(input.max ? { lte: toNumber(input.max) } : {})
          }
        }
      : {})
  };

  const orderBy =
    input.sort === "price-asc"
      ? { basePrice: "asc" as const }
      : input.sort === "price-desc"
        ? { basePrice: "desc" as const }
        : input.sort === "rating"
          ? { averageRating: "desc" as const }
          : input.sort === "newest"
            ? { createdAt: "desc" as const }
            : { featured: "desc" as const };

  const products = await db.product.findMany({
    where,
    orderBy,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      seller: true,
      category: true,
      variants: { orderBy: { price: "asc" }, take: 1 }
    }
  });

  return serializeForClient(products);
}

export async function searchProducts(input: ProductQueryInput = {}) {
  const cacheKey = `search:${JSON.stringify(input)}`;
  const cached = await cacheGet<Awaited<ReturnType<typeof getProducts>>>(cacheKey);

  if (cached) return cached;

  const products = await getProducts(input);
  await cacheSet(cacheKey, products, 180);

  return products;
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");

  const product = await db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      seller: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { price: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { firstName: true, lastName: true } } }
      }
    }
  });

  return serializeForClient(product);
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheLife("hours");

  return db.category.findUnique({
    where: { slug }
  });
}

export async function getProductsForCategory(slug: string) {
  return getProducts({ category: slug, sort: "featured" });
}
