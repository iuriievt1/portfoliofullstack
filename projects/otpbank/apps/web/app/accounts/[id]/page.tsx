import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Account details">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Detailed balance, cards, and transaction timeline views are intended here.</CardContent>
      </Card>
    </AppShell>
  );
}
