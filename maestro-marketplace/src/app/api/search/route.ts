import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/services/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const products = await searchProducts({ q });

  return NextResponse.json({
    products: products.slice(0, 10).map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.basePrice),
      image: product.images[0]?.url ?? null,
      category: product.category.name,
      seller: product.seller.storeName
    }))
  });
}
