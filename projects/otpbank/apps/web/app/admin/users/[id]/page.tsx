import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin user detail">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Backoffice user profile, sessions, accounts, notes, and KYC drill-down land here.</CardContent>
      </Card>
    </AppShell>
  );
}
