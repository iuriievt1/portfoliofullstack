import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validations/review";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }

  const { productId, rating, title, body: reviewBody } = parsed.data;

  await db.review.upsert({
    where: {
      productId_userId: {
        productId,
        userId: user.id
      }
    },
    create: {
      productId,
      userId: user.id,
      rating,
      title,
      body: reviewBody
    },
    update: {
      rating,
      title,
      body: reviewBody
    }
  });

  const aggregate = await db.review.aggregate({
    where: { productId, isPublished: true },
    _avg: { rating: true },
    _count: { _all: true }
  });

  await db.product.update({
    where: { id: productId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count._all
    }
  });

  return NextResponse.json({ ok: true });
}
