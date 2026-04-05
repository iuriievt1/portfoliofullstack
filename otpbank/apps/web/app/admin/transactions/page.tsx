import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin transactions">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Ops-grade transaction monitoring and manual review table land here.</CardContent>
      </Card>
    </AppShell>
  );
}
