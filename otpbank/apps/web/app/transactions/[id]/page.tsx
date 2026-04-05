import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Transaction details">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Receipt, journal trail, risk timeline, and audit-linked metadata land here.</CardContent>
      </Card>
    </AppShell>
  );
}
