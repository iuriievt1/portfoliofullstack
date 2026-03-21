import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { seller: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Orders</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Order history</h1>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Seller</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.seller.storeName}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{formatPrice(order.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
