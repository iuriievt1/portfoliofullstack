import { Container } from "@/components/shared/container";

export default function PrivacyPage() {
  return (
    <Container className="max-w-4xl space-y-6 py-14">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Legal</div>
      <h1 className="text-4xl font-semibold tracking-tight">Privacy policy</h1>
      <p className="leading-8 text-muted-foreground">Maestro processes account, order, inventory, and operational data to provide marketplace services, seller tooling, fraud controls, and customer support. In production, pair this page with jurisdiction-specific privacy terms, cookie policy, retention windows, and DSAR workflows.</p>
    </Container>
  );
}
