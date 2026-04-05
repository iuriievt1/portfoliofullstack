import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin users">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Full user management table with filters and risk/KYC pivots lands here.</CardContent>
      </Card>
    </AppShell>
  );
}
