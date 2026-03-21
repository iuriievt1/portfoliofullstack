import Link from "next/link";
import { Container } from "@/components/shared/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <Container className="grid gap-8 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-xl font-semibold text-primary">Maestro</div>
          <p className="text-sm leading-6 text-muted-foreground">Premium multi-vendor commerce designed for trust, speed, and scale.</p>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Shop</div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/products">All products</Link>
            <Link href="/search">Search</Link>
            <Link href="/wishlist">Wishlist</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Sell</div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/seller">Seller dashboard</Link>
            <Link href="/seller/onboarding">Become a seller</Link>
            <Link href="/help">Seller help</Link>
          </div>
        </div>
        <div className="space-y-3">
          <div className="font-medium">Legal</div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/help">Support</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
