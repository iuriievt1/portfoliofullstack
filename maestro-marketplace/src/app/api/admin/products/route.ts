import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { moderateProduct } from "@/lib/services/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const productId = String(formData.get("productId") || "");
  const action = String(formData.get("action") || "");

  if (!productId || (action !== "approve" && action !== "reject")) {
    return NextResponse.redirect(new URL("/admin/moderation?error=validation", request.url));
  }

  await moderateProduct(productId, action);
  return NextResponse.redirect(new URL("/admin/moderation?updated=1", request.url));
}
