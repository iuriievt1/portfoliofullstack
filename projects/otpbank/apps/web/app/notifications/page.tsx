import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Notifications">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">In-app notifications list and read-state controls land here.</CardContent>
      </Card>
    </AppShell>
  );
}
