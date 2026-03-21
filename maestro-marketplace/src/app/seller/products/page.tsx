import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export default async function SellerProductsPage() {
  const user = await requireUser();
  const seller = await db.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/onboarding");

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { sellerId: seller.id },
      include: { category: true, variants: true },
      orderBy: { updatedAt: "desc" }
    }),
    db.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Products</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Catalog management</h1>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Create product</h2>
          <form action="/api/seller/products" method="post" className="grid gap-4 md:grid-cols-2">
            <input name="title" placeholder="Title" className="h-11 rounded-2xl border border-input px-4" required />
            <select name="categoryId" className="h-11 rounded-2xl border border-input px-4" required>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input name="sku" placeholder="SKU" className="h-11 rounded-2xl border border-input px-4" required />
            <input name="basePrice" type="number" step="0.01" placeholder="Base price" className="h-11 rounded-2xl border border-input px-4" required />
            <input name="compareAtPrice" type="number" step="0.01" placeholder="Compare-at price" className="h-11 rounded-2xl border border-input px-4" />
            <input name="stock" type="number" placeholder="Stock" className="h-11 rounded-2xl border border-input px-4" required />
            <input name="shortDescription" placeholder="Short description" className="h-11 rounded-2xl border border-input px-4 md:col-span-2" />
            <textarea name="description" placeholder="Description" className="min-h-[120px] rounded-2xl border border-input px-4 py-3 md:col-span-2" required />
            <button className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground md:w-fit">Save product</button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead></TableRow></TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.title}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{product.status}</TableCell>
              <TableCell>{formatPrice(product.basePrice)}</TableCell>
              <TableCell>{product.variants.reduce((sum, item) => sum + item.stock, 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
