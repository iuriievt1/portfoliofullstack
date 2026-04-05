import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin risk">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Risk event queue and review workflow land here.</CardContent>
      </Card>
    </AppShell>
  );
}
