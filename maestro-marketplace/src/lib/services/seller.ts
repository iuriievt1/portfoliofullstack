import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function getSellerDashboard(userId: string) {
  const seller = await db.sellerProfile.findUnique({ where: { userId } });
  if (!seller) return null;

  const [productCount, activeOrders, revenue, pendingProducts, recentOrders] = await Promise.all([
    db.product.count({ where: { sellerId: seller.id } }),
    db.order.count({ where: { sellerId: seller.id, status: { in: ["PAID", "PROCESSING"] } } }),
    db.order.aggregate({ where: { sellerId: seller.id, paymentStatus: "PAID" }, _sum: { total: true } }),
    db.product.count({ where: { sellerId: seller.id, status: "PENDING" } }),
    db.order.findMany({
      where: { sellerId: seller.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return {
    seller,
    metrics: {
      productCount,
      activeOrders,
      revenue: Number(revenue._sum.total ?? 0),
      pendingProducts
    },
    recentOrders
  };
}

export async function createSellerProfile(userId: string, input: {
  storeName: string;
  legalName: string;
  supportEmail: string;
  description: string;
}) {
  const existing = await db.sellerProfile.findUnique({ where: { userId } });

  if (existing) {
    return db.sellerProfile.update({
      where: { userId },
      data: {
        ...input,
        slug: slugify(input.storeName),
        status: "PENDING",
        onboardingCompletedAt: new Date()
      }
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { role: "SELLER" }
  });

  return db.sellerProfile.create({
    data: {
      userId,
      slug: slugify(input.storeName),
      ...input,
      status: "PENDING",
      onboardingCompletedAt: new Date()
    }
  });
}

export async function createSellerProduct(userId: string, input: {
  title: string;
  categoryId: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
}) {
  const seller = await db.sellerProfile.findUnique({ where: { userId } });
  if (!seller) throw new Error("Seller profile not found");

  return db.product.create({
    data: {
      sellerId: seller.id,
      categoryId: input.categoryId,
      title: input.title,
      slug: slugify(input.title),
      shortDescription: input.shortDescription,
      description: input.description,
      sku: input.sku,
      basePrice: input.basePrice,
      compareAtPrice: input.compareAtPrice,
      searchKeywords: input.title.toLowerCase().split(" "),
      status: seller.status === "ACTIVE" ? "PENDING" : "DRAFT",
      variants: {
        create: {
          name: "Default",
          sku: `${input.sku}-DEFAULT`,
          price: input.basePrice,
          stock: input.stock,
          isDefault: true
        }
      }
    }
  });
}
