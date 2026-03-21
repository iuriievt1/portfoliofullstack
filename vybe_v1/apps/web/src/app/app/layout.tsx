import { AuthGuard } from "../../components/auth-guard";
import { NavShell } from "../../components/nav-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <NavShell>{children}</NavShell>
    </AuthGuard>
  );
}

