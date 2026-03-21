import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/forms/add-to-cart-button";
import { WishlistButton } from "@/components/forms/wishlist-button";

type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    basePrice: number | string;
    compareAtPrice: number | string | null;
    averageRating: number | string;
    reviewCount: number;
    images: Array<{ url: string; alt: string | null }>;
    seller: { storeName: string };
    variants: Array<{ id: string; price: number | string }>;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[4/4.2] overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}

        <div className="absolute left-4 top-4 flex gap-2">
          <Badge>Premium</Badge>
          {product.reviewCount > 0 ? (
            <Badge className="bg-background/90 text-foreground">
              {Number(product.averageRating).toFixed(1)} ★
            </Badge>
          ) : null}
        </div>

        <div className="absolute right-4 top-4">
          <WishlistButton productId={product.id} />
        </div>
      </div>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {product.seller.storeName}
          </div>

          <Link href={`/products/${product.slug}`} className="text-lg font-semibold">
            {product.title}
          </Link>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">
              {formatPrice(product.variants[0]?.price ?? product.basePrice)}
            </div>

            {product.compareAtPrice ? (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </div>
            ) : null}
          </div>

          <AddToCartButton
            productId={product.id}
            variantId={product.variants[0]?.id}
            quantity={1}
          />
        </div>
      </CardContent>
    </Card>
  );
}
