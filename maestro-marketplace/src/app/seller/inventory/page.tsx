import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SellerInventoryPage() {
  const user = await requireUser();
  const seller = await db.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/onboarding");

  const variants = await db.productVariant.findMany({
    where: { product: { sellerId: seller.id } },
    include: { product: true },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Inventory</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Stock visibility</h1>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Variant</TableHead><TableHead>SKU</TableHead><TableHead>Stock</TableHead><TableHead>Reserved</TableHead></TableRow></TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell>{variant.product.title}</TableCell>
              <TableCell>{variant.name}</TableCell>
              <TableCell>{variant.sku}</TableCell>
              <TableCell>{variant.stock}</TableCell>
              <TableCell>{variant.reservedStock}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
