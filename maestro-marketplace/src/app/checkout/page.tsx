import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { calculateCartTotals } from "@/lib/services/cart";
import { formatPrice } from "@/lib/utils";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("maestro_cart")?.value;
  const summary = await calculateCartTotals(sessionToken, user.id);

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_380px]">
      <form id="checkout-form" action="/api/checkout" method="post" className="space-y-6">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Checkout</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Complete your order</h1>
        </div>

        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="md:col-span-2 text-lg font-semibold">Shipping address</div>
            <div className="space-y-2"><Label htmlFor="shippingFullName">Full name</Label><Input id="shippingFullName" name="shippingFullName" required /></div>
            <div className="space-y-2"><Label htmlFor="shippingPhone">Phone</Label><Input id="shippingPhone" name="shippingPhone" required /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="shippingLine1">Address line 1</Label><Input id="shippingLine1" name="shippingLine1" required /></div>
            <div className="space-y-2"><Label htmlFor="shippingCity">City</Label><Input id="shippingCity" name="shippingCity" required /></div>
            <div className="space-y-2"><Label htmlFor="shippingState">State / region</Label><Input id="shippingState" name="shippingState" /></div>
            <div className="space-y-2"><Label htmlFor="shippingPostalCode">Postal code</Label><Input id="shippingPostalCode" name="shippingPostalCode" required /></div>
            <div className="space-y-2"><Label htmlFor="shippingCountry">Country</Label><Input id="shippingCountry" name="shippingCountry" required /></div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="md:col-span-2 text-lg font-semibold">Billing address</div>
            <div className="space-y-2"><Label htmlFor="billingFullName">Full name</Label><Input id="billingFullName" name="billingFullName" required /></div>
            <div className="space-y-2"><Label htmlFor="billingPhone">Phone</Label><Input id="billingPhone" name="billingPhone" required /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="billingLine1">Address line 1</Label><Input id="billingLine1" name="billingLine1" required /></div>
            <div className="space-y-2"><Label htmlFor="billingCity">City</Label><Input id="billingCity" name="billingCity" required /></div>
            <div className="space-y-2"><Label htmlFor="billingState">State / region</Label><Input id="billingState" name="billingState" /></div>
            <div className="space-y-2"><Label htmlFor="billingPostalCode">Postal code</Label><Input id="billingPostalCode" name="billingPostalCode" required /></div>
            <div className="space-y-2"><Label htmlFor="billingCountry">Country</Label><Input id="billingCountry" name="billingCountry" required /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="couponCode">Coupon code</Label><Input id="couponCode" name="couponCode" placeholder="WELCOME10" /></div>
          </CardContent>
        </Card>
      </form>

      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(summary.shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(summary.tax)}</span></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{formatPrice(summary.total)}</span></div>
          </div>
          <Button type="submit" form="checkout-form" className="w-full">Place order</Button>
          <p className="text-xs leading-6 text-muted-foreground">Stripe-ready architecture is wired in. If Stripe keys are missing, the app falls back to manual pending-order creation for local development.</p>
        </CardContent>
      </Card>
    </Container>
  );
}
