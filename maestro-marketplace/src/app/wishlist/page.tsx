import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeForClient } from "@/lib/utils";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");

  const rawItems = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { position: "asc" } },
          seller: true,
          variants: { take: 1, orderBy: { price: "asc" } }
        }
      }
    }
  });

  const items = serializeForClient(rawItems);

  return (
    <Container className="space-y-8 py-14">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Wishlist
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Saved products
        </h1>
      </div>

      {items.length ? (
        <ProductGrid products={items.map((item) => item.product)} />
      ) : (
        <div className="rounded-3xl border border-border p-8">
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button>Explore products</Button>
          </Link>
        </div>
      )}
    </Container>
  );
}
