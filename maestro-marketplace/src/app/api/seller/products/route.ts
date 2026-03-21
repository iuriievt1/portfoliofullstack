import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSellerProduct } from "@/lib/services/seller";
import { sellerProductSchema } from "@/lib/validations/seller";

function getNumber(formData: FormData, key: string) {
  return Number(formData.get(key) || 0);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const formData = await request.formData();
  const payload = {
    title: String(formData.get("title") || ""),
    categoryId: String(formData.get("categoryId") || ""),
    description: String(formData.get("description") || ""),
    shortDescription: String(formData.get("shortDescription") || "") || undefined,
    basePrice: getNumber(formData, "basePrice"),
    compareAtPrice: formData.get("compareAtPrice") ? getNumber(formData, "compareAtPrice") : undefined,
    sku: String(formData.get("sku") || ""),
    stock: getNumber(formData, "stock")
  };

  const parsed = sellerProductSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/seller/products?error=validation", request.url));
  }

  try {
    await createSellerProduct(user.id, parsed.data);
    return NextResponse.redirect(new URL("/seller/products?created=1", request.url));
  } catch {
    return NextResponse.redirect(new URL("/seller/products?error=create", request.url));
  }
}
