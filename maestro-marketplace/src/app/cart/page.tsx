import Link from "next/link";
import { cookies } from "next/headers";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { calculateCartTotals } from "@/lib/services/cart";
import { formatPrice } from "@/lib/utils";

export default async function CartPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("maestro_cart")?.value;
  const user = await getCurrentUser();
  const summary = await calculateCartTotals(sessionToken, user?.id);

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Cart</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Shopping cart</h1>
        </div>
        {summary.cart?.items.length ? summary.cart.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between gap-6 pt-6">
              <div className="space-y-1">
                <div className="text-lg font-semibold">{item.product.title}</div>
                <div className="text-sm text-muted-foreground">{item.product.seller.storeName} · Qty {item.quantity}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatPrice(item.unitPrice)}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(Number(item.unitPrice) * item.quantity)}</div>
              </div>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="pt-6"><p className="text-muted-foreground">Your cart is empty.</p></CardContent></Card>}
      </div>

      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Items</span><span>{summary.itemCount}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(summary.shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(summary.tax)}</span></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatPrice(summary.total)}</span></div>
          </div>
          <Link href="/checkout" className="block"><Button className="w-full" disabled={!summary.itemCount}>Proceed to checkout</Button></Link>
        </CardContent>
      </Card>
    </Container>
  );
}
