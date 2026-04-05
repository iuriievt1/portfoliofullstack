import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Card details">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Virtual card controls, limits, channel toggles, and transaction history land here.</CardContent>
      </Card>
    </AppShell>
  );
}
