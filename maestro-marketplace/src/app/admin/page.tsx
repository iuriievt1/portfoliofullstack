import { MetricCard } from "@/components/dashboard/metric-card";
import { getAdminOverview } from "@/lib/services/admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Admin overview</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Marketplace operations</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Users" value={String(overview.users)} />
        <MetricCard label="Sellers" value={String(overview.sellers)} />
        <MetricCard label="Pending sellers" value={String(overview.pendingSellers)} />
        <MetricCard label="Gross sales" value={formatPrice(overview.grossSales)} />
      </div>
    </div>
  );
}
