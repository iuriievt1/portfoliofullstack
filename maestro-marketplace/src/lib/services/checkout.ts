import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { getCart } from "@/lib/services/cart";
import { getStripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function createCheckoutSession(input: {
  userId: string;
  sessionToken?: string | null;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  couponCode?: string;
}) {
  const cart = await getCart(input.sessionToken, input.userId);
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const groupedBySeller = new Map<string, typeof cart.items>();
  for (const item of cart.items) {
    const sellerId = item.product.sellerId;
    if (!groupedBySeller.has(sellerId)) groupedBySeller.set(sellerId, []);
    groupedBySeller.get(sellerId)!.push(item);
  }

  const operations = Array.from(groupedBySeller.entries()).map(([sellerId, items]) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 12;
    const tax = subtotal * 0.08;
    const discount = input.couponCode ? subtotal * 0.1 : 0;
    const total = subtotal - discount + shipping + tax;

    return db.order.create({
      data: {
        orderNumber: `MAE-${randomUUID().slice(0, 8).toUpperCase()}`,
        userId: input.userId,
        sellerId,
        status: "AWAITING_PAYMENT",
        paymentStatus: "UNPAID",
        subtotal,
        discountTotal: discount,
        shippingTotal: shipping,
        taxTotal: tax,
        total,
        couponCode: input.couponCode || undefined,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            titleSnapshot: item.product.title,
            skuSnapshot: item.variant?.sku ?? item.product.sku,
            unitPrice: item.unitPrice,
            totalPrice: Number(item.unitPrice) * item.quantity
          }))
        }
      }
    });
  });

  const createdOrders = await db.$transaction(operations);

  const stripe = getStripe();
  if (!stripe) {
    return {
      mode: "manual" as const,
      url: `${absoluteUrl("/account/orders")}?placed=1`,
      orders: createdOrders
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${absoluteUrl("/account/orders")}?success=1`,
    cancel_url: `${absoluteUrl("/checkout")}?cancelled=1`,
    line_items: cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: item.product.currency.toLowerCase(),
        product_data: {
          name: item.product.title,
          description: item.product.shortDescription ?? undefined
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100)
      }
    }))
  });

  await Promise.all(
    createdOrders.map((order) =>
      db.order.update({
        where: { id: order.id },
        data: { stripeCheckoutSessionId: session.id }
      })
    )
  );

  return {
    mode: "stripe" as const,
    url: session.url!,
    orders: createdOrders
  };
}
