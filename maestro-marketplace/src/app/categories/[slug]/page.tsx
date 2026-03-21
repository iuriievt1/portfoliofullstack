import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { ProductGrid } from "@/components/product/product-grid";
import { createMetadata } from "@/lib/seo";
import { getCategoryBySlug, getProductsForCategory } from "@/lib/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  return createMetadata({
    title: category?.name || "Category",
    description: category?.description || "Category page",
    path: `/categories/${slug}`
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, products] = await Promise.all([getCategoryBySlug(slug), getProductsForCategory(slug)]);
  if (!category) notFound();

  return (
    <Container className="space-y-10 py-14">
      <div className="max-w-3xl space-y-4">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Category</div>
        <h1 className="text-4xl font-semibold tracking-tight">{category.name}</h1>
        <p className="text-lg leading-8 text-muted-foreground">{category.description}</p>
      </div>
      <ProductGrid products={products} />
    </Container>
  );
}
