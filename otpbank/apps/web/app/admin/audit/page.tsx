import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin audit">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Audit explorer lands here.</CardContent>
      </Card>
    </AppShell>
  );
}
