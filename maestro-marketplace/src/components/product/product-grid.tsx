import { ProductCard } from "@/components/product/product-card";

export function ProductGrid({
  products
}: {
  products: Array<Parameters<typeof ProductCard>[0]["product"]>;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
