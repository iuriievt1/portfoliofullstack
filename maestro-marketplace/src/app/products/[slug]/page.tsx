import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/forms/review-form";
import { AddToCartButton } from "@/components/forms/add-to-cart-button";
import { createMetadata } from "@/lib/seo";
import { getProductBySlug } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return createMetadata({
    title: product?.title || "Product",
    description: product?.shortDescription ?? product?.description.slice(0, 140) ?? "Product page",
    path: `/products/${slug}`
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const primaryVariant = product.variants.find((item) => item.isDefault) || product.variants[0];

  return (
    <Container className="space-y-16 py-14">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ProductGallery images={product.images} title={product.title} />
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{product.category.name}</Badge>
            <Badge className="bg-secondary text-secondary-foreground">{product.seller.storeName}</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">{product.title}</h1>
            <p className="text-lg leading-8 text-muted-foreground">{product.shortDescription ?? product.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-semibold">{formatPrice(primaryVariant?.price ?? product.basePrice)}</div>
            {product.compareAtPrice ? <div className="text-lg text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</div> : null}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-primary" />
            {Number(product.averageRating).toFixed(1)} rating · {product.reviewCount} reviews
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Selected variant</div>
                <div className="mt-2 font-semibold">{primaryVariant?.name ?? "Default"}</div>
                <div className="mt-1 text-sm text-muted-foreground">Stock: {primaryVariant?.stock ?? 0} available</div>
              </div>
              <AddToCartButton productId={product.id} variantId={primaryVariant?.id} quantity={1} />
              <Button variant="outline">Buy now</Button>
            </div>
          </div>
          <div className="rounded-3xl border border-border p-6">
            <h2 className="text-xl font-semibold">Product details</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4 rounded-3xl border border-border p-6">
          <h2 className="text-2xl font-semibold">Reviews</h2>
          <div className="grid gap-4">
            {product.reviews.length ? product.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl bg-secondary p-5">
                <div className="font-semibold">{review.user.firstName} {review.user.lastName.slice(0, 1)}.</div>
                <div className="mt-1 text-sm text-muted-foreground">{review.rating}/5 · {review.title}</div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.body}</p>
              </div>
            )) : <p className="text-muted-foreground">No reviews yet.</p>}
          </div>
        </div>
        <ReviewForm productId={product.id} />
      </div>
    </Container>
  );
}
