import { Container } from "@/components/shared/container";

export default function TermsPage() {
  return (
    <Container className="max-w-4xl space-y-6 py-14">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Legal</div>
      <h1 className="text-4xl font-semibold tracking-tight">Terms of service</h1>
      <p className="leading-8 text-muted-foreground">Maestro provides a marketplace infrastructure layer that enables customers to discover products and sellers to operate storefronts, manage catalog data, track orders, and receive payouts subject to platform review, payment provider terms, and local regulation.</p>
    </Container>
  );
}
