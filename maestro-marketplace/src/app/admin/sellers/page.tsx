import { getModerationQueues } from "@/lib/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminSellersPage() {
  const { sellerApplications } = await getModerationQueues();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Sellers</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Seller applications</h1>
      </div>
      <div className="grid gap-4">
        {sellerApplications.map((seller) => (
          <Card key={seller.id}>
            <CardContent className="space-y-4 pt-6">
              <div>
                <div className="text-lg font-semibold">{seller.storeName}</div>
                <p className="text-sm text-muted-foreground">{seller.user.firstName} {seller.user.lastName} · {seller.supportEmail}</p>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{seller.description}</p>
              <div className="flex gap-3">
                <form action="/api/admin/sellers" method="post">
                  <input type="hidden" name="sellerId" value={seller.id} />
                  <input type="hidden" name="action" value="approve" />
                  <Button type="submit">Approve</Button>
                </form>
                <form action="/api/admin/sellers" method="post">
                  <input type="hidden" name="sellerId" value={seller.id} />
                  <input type="hidden" name="action" value="reject" />
                  <Button type="submit" variant="outline">Reject</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
