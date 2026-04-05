import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Support user detail">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Support user profile, sessions, notes, and case timeline land here.</CardContent>
      </Card>
    </AppShell>
  );
}
