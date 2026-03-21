import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSellerProfile } from "@/lib/services/seller";
import { sellerOnboardingSchema } from "@/lib/validations/seller";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sellerOnboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid onboarding payload." }, { status: 400 });
  }

  await createSellerProfile(user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
