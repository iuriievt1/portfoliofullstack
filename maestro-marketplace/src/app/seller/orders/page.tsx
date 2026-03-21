import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export default async function SellerOrdersPage() {
  const user = await requireUser();
  const seller = await db.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/onboarding");

  const orders = await db.order.findMany({
    where: { sellerId: seller.id },
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Orders</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Seller orders</h1>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.items.length}</TableCell>
              <TableCell>{formatPrice(order.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
