import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatPrice } from "@/lib/utils";

export default async function SellerAnalyticsPage() {
  const user = await requireUser();
  const seller = await db.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/onboarding");

  const [revenue, orders, topProducts] = await Promise.all([
    db.order.aggregate({ where: { sellerId: seller.id, paymentStatus: "PAID" }, _sum: { total: true } }),
    db.order.count({ where: { sellerId: seller.id } }),
    db.product.findMany({
      where: { sellerId: seller.id },
      orderBy: [{ reviewCount: "desc" }, { averageRating: "desc" }],
      take: 5
    })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Analytics</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Performance overview</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total revenue" value={formatPrice(revenue._sum.total ?? 0)} />
        <MetricCard label="Orders" value={String(orders)} />
        <MetricCard label="Top products" value={String(topProducts.length)} />
      </div>
      <div className="rounded-3xl border border-border p-6">
        <h2 className="text-xl font-semibold">Top ranked products</h2>
        <div className="mt-4 grid gap-3">
          {topProducts.map((product) => (
            <div key={product.id} className="rounded-2xl bg-secondary p-4">
              <div className="font-medium">{product.title}</div>
              <div className="text-sm text-muted-foreground">{Number(product.averageRating).toFixed(1)} rating · {product.reviewCount} reviews</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
