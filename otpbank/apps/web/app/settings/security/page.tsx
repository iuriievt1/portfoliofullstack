import { Card, CardContent, CardHeader } from "@otpbank/ui";
import { AppShell } from "../../../components/app-shell";

export default function SecuritySettingsPage() {
  return (
    <AppShell title="Security center">
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Security posture</h2></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>2FA / OTP hooks are enabled in the API and exposed through dedicated endpoints.</p>
          <p>Refresh tokens rotate at every refresh event. Sessions can be revoked individually.</p>
          <p>For public launch, replace mock OTP delivery with a regulated-grade notification provider and add WebAuthn hardware-backed factors.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
