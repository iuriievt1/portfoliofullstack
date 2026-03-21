import { db } from "@/lib/db";
import { addDays } from "@/lib/services/date";

export async function ensureCart({
  sessionToken,
  userId
}: {
  sessionToken?: string | null;
  userId?: string | null;
}) {
  if (userId) {
    const existingUserCart = await db.cart.findFirst({
      where: { userId, expiresAt: { gt: new Date() } }
    });
    if (existingUserCart) return existingUserCart;
  }

  if (sessionToken) {
    const existingSessionCart = await db.cart.findFirst({
      where: { sessionToken, expiresAt: { gt: new Date() } }
    });
    if (existingSessionCart) return existingSessionCart;
  }

  return db.cart.create({
    data: {
      userId: userId ?? null,
      sessionToken: sessionToken ?? null,
      expiresAt: addDays(new Date(), 14)
    }
  });
}

export async function getCart(sessionToken?: string | null, userId?: string | null) {
  if (!sessionToken && !userId) return null;

  return db.cart.findFirst({
    where: {
      OR: [
        ...(sessionToken ? [{ sessionToken }] : []),
        ...(userId ? [{ userId }] : [])
      ],
      expiresAt: { gt: new Date() }
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { position: "asc" } },
              seller: true
            }
          },
          variant: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function addCartItem({
  sessionToken,
  userId,
  productId,
  variantId,
  quantity
}: {
  sessionToken?: string | null;
  userId?: string | null;
  productId: string;
  variantId?: string | null;
  quantity: number;
}) {
  const cart = await ensureCart({ sessionToken, userId });
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { variants: true }
  });

  if (!product || product.status !== "ACTIVE") {
    throw new Error("Product is unavailable");
  }

  const variant =
    variantId
      ? product.variants.find((item) => item.id === variantId)
      : product.variants.find((item) => item.isDefault) || product.variants[0];

  if (!variant || quantity > variant.stock) {
    throw new Error("Requested quantity exceeds available inventory");
  }

  const existingItem = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variant.id
    }
  });

  if (existingItem) {
    return db.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        unitPrice: variant.price
      }
    });
  }

  return db.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId: variant.id,
      quantity,
      unitPrice: variant.price
    }
  });
}

export async function removeCartItem(itemId: string) {
  return db.cartItem.delete({ where: { id: itemId } });
}

export async function calculateCartTotals(sessionToken?: string | null, userId?: string | null) {
  const cart = await getCart(sessionToken, userId);

  if (!cart) {
    return { cart: null, subtotal: 0, itemCount: 0, shipping: 0, tax: 0, total: 0 };
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : subtotal > 0 ? 12 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return {
    cart,
    subtotal,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    shipping,
    tax,
    total
  };
}
