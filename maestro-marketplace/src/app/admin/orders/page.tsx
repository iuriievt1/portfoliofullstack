import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { user: true, seller: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Orders</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Marketplace orders</h1>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Seller</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.orderNumber}</TableCell>
              <TableCell>{order.user.email}</TableCell>
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
