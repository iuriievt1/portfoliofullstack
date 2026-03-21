import { db } from "@/lib/db";

export async function getAdminOverview() {
  const [users, sellers, pendingSellers, pendingProducts, grossSales] = await Promise.all([
    db.user.count(),
    db.sellerProfile.count(),
    db.sellerProfile.count({ where: { status: "PENDING" } }),
    db.product.count({ where: { status: "PENDING" } }),
    db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } })
  ]);

  return {
    users,
    sellers,
    pendingSellers,
    pendingProducts,
    grossSales: Number(grossSales._sum.total ?? 0)
  };
}

export async function getModerationQueues() {
  const [pendingProducts, sellerApplications, coupons] = await Promise.all([
    db.product.findMany({
      where: { status: "PENDING" },
      include: { seller: true, category: true },
      orderBy: { createdAt: "asc" }
    }),
    db.sellerProfile.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    }),
    db.coupon.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return { pendingProducts, sellerApplications, coupons };
}

export async function moderateSeller(sellerId: string, action: "approve" | "reject") {
  return db.sellerProfile.update({
    where: { id: sellerId },
    data: {
      status: action === "approve" ? "ACTIVE" : "REJECTED",
      approvedAt: action === "approve" ? new Date() : null,
      rejectedReason: action === "reject" ? "Application needs revision before approval." : null
    }
  });
}

export async function moderateProduct(productId: string, action: "approve" | "reject") {
  return db.product.update({
    where: { id: productId },
    data: {
      status: action === "approve" ? "ACTIVE" : "REJECTED",
      publishedAt: action === "approve" ? new Date() : null,
      moderationNotes: action === "reject" ? "Product requires updated imagery or compliance review." : null
    }
  });
}
