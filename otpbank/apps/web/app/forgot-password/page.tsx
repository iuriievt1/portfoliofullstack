import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@otpbank/ui";

export default function Page() {
  return (
    <AppShell title="Forgot password">
      <Card>
        <CardContent className="py-10 text-sm text-slate-500">Password reset request UX lands here.</CardContent>
      </Card>
    </AppShell>
  );
}
