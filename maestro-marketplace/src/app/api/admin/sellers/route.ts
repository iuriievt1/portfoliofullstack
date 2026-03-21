import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { moderateSeller } from "@/lib/services/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const sellerId = String(formData.get("sellerId") || "");
  const action = String(formData.get("action") || "");

  if (!sellerId || (action !== "approve" && action !== "reject")) {
    return NextResponse.redirect(new URL("/admin/sellers?error=validation", request.url));
  }

  await moderateSeller(sellerId, action);
  return NextResponse.redirect(new URL("/admin/sellers?updated=1", request.url));
}
