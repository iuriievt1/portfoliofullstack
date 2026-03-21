import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import { getSellerDashboard } from "@/lib/services/seller";
import { formatPrice } from "@/lib/utils";

export default async function SellerOverviewPage() {
  const user = await requireUser();
  const dashboard = await getSellerDashboard(user.id);
  if (!dashboard) redirect("/seller/onboarding");

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Store overview</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{dashboard.seller.storeName}</h1>
        <p className="mt-3 text-muted-foreground">Status: {dashboard.seller.status} · Payouts {dashboard.seller.payoutsEnabled ? "enabled" : "pending"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Products" value={String(dashboard.metrics.productCount)} />
        <MetricCard label="Active orders" value={String(dashboard.metrics.activeOrders)} />
        <MetricCard label="Gross revenue" value={formatPrice(dashboard.metrics.revenue)} />
        <MetricCard label="Pending moderation" value={String(dashboard.metrics.pendingProducts)} />
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          <div className="grid gap-3">
            {dashboard.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl bg-secondary p-4">
                <div>
                  <div className="font-medium">{order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">{order.user.firstName} {order.user.lastName}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(order.total)}</div>
                  <div className="text-sm text-muted-foreground">{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
