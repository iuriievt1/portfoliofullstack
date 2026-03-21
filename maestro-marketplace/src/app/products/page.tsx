import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { FilterSidebar } from "@/components/product/filter-sidebar";
import { createMetadata } from "@/lib/seo";
import { searchProducts } from "@/lib/services/catalog";

export const metadata = createMetadata({
  title: "Shop",
  description: "Browse the Maestro marketplace catalog.",
  path: "/products"
});

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const current = {
    q: typeof query.q === "string" ? query.q : undefined,
    category: typeof query.category === "string" ? query.category : undefined,
    min: typeof query.min === "string" ? query.min : undefined,
    max: typeof query.max === "string" ? query.max : undefined,
    rating: typeof query.rating === "string" ? query.rating : undefined,
    sort: typeof query.sort === "string" ? query.sort : undefined
  };
  const products = await searchProducts(current);

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[320px_1fr]">
      <div className="lg:sticky lg:top-28 lg:h-fit"><FilterSidebar current={current} /></div>
      <div className="space-y-8">
        <SectionHeading eyebrow="Marketplace catalog" title="All products" description={`${products.length} products found.`} />
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
