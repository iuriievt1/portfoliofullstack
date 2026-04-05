import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Admin accounts">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Account operations, freeze/unfreeze, and state controls land here.</CardContent>
      </Card>
    </AppShell>
  );
}
