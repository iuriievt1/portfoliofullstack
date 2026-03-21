import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/services/checkout";

const CART_COOKIE = "maestro_cart";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const formData = await request.formData();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CART_COOKIE)?.value ?? null;

  const shippingAddress = {
    fullName: getString(formData, "shippingFullName"),
    line1: getString(formData, "shippingLine1"),
    city: getString(formData, "shippingCity"),
    postalCode: getString(formData, "shippingPostalCode"),
    country: getString(formData, "shippingCountry")
  };

  const billingAddress = {
    fullName: getString(formData, "billingFullName"),
    line1: getString(formData, "billingLine1"),
    city: getString(formData, "billingCity"),
    postalCode: getString(formData, "billingPostalCode"),
    country: getString(formData, "billingCountry")
  };

  try {
    const session = await createCheckoutSession({
      userId: user.id,
      sessionToken,
      shippingAddress,
      billingAddress,
      couponCode: getString(formData, "couponCode") || undefined
    });

    return NextResponse.redirect(session.url);
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/checkout?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Checkout failed."
        )}`,
        request.url
      )
    );
  }
}
