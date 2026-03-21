import { headers } from "next/headers";
import { requireRole } from "@/lib/auth";
import { Container } from "@/components/shared/container";
import { adminNavigation } from "@/lib/constants";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN"]);
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "/admin";

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[250px_1fr]">
      <aside className="space-y-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Admin</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Control center</h1>
        </div>
        <DashboardNav items={adminNavigation} pathname={pathname} />
      </aside>
      <div>{children}</div>
    </Container>
  );
}
