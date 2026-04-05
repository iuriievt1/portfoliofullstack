import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Support notes">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Support notes queue lands here.</CardContent>
      </Card>
    </AppShell>
  );
}
