import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin fees">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Fee rule management lands here.</CardContent>
      </Card>
    </AppShell>
  );
}
