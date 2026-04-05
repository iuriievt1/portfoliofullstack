import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Reset password">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Password reset completion UX lands here.</CardContent>
      </Card>
    </AppShell>
  );
}
