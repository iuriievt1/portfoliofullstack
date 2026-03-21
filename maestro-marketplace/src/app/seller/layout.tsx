import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { Container } from "@/components/shared/container";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { sellerNavigation } from "@/lib/constants";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    return <Container className="py-14"><p className="text-muted-foreground">Seller access is required.</p></Container>;
  }

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "/seller";

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[250px_1fr]">
      <aside className="space-y-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Seller</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <DashboardNav items={sellerNavigation} pathname={pathname} />
      </aside>
      <div>{children}</div>
    </Container>
  );
}
