import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addCartItem, calculateCartTotals, removeCartItem } from "@/lib/services/cart";
import { cartItemSchema } from "@/lib/validations/cart";

const CART_COOKIE = "maestro_cart";

export async function GET() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  const sessionToken = cookieStore.get(CART_COOKIE)?.value ?? null;
  const cart = await calculateCartTotals(sessionToken, user?.id ?? null);

  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const user = await getCurrentUser();
  const body = await request.json().catch(() => null);
  const parsed = cartItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload." }, { status: 400 });
  }

  const sessionToken = cookieStore.get(CART_COOKIE)?.value ?? randomUUID();

  try {
    await addCartItem({
      sessionToken,
      userId: user?.id ?? null,
      ...parsed.data
    });

    const response = NextResponse.json({ ok: true });
    if (!cookieStore.get(CART_COOKIE)?.value) {
      response.cookies.set(CART_COOKIE, sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 14,
        path: "/"
      });
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add item to cart." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const itemId = typeof body?.itemId === "string" ? body.itemId : null;

  if (!itemId) {
    return NextResponse.json({ error: "Missing cart item id." }, { status: 400 });
  }

  await removeCartItem(itemId);
  return NextResponse.json({ ok: true });
}
