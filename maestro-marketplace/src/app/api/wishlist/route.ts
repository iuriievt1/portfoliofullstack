import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : null;

  if (!productId) {
    return NextResponse.json({ error: "Missing product id." }, { status: 400 });
  }

  await db.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: user.id,
        productId
      }
    },
    create: {
      userId: user.id,
      productId
    },
    update: {}
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : null;

  if (!productId) {
    return NextResponse.json({ error: "Missing product id." }, { status: 400 });
  }

  await db.wishlistItem.deleteMany({
    where: {
      userId: user.id,
      productId
    }
  });

  return NextResponse.json({ ok: true });
}
