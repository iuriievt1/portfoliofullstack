import { getModerationQueues } from "@/lib/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default async function AdminModerationPage() {
  const { pendingProducts } = await getModerationQueues();

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Moderation</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Product approval queue</h1>
      </div>
      <div className="grid gap-4">
        {pendingProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{product.title}</div>
                  <p className="text-sm text-muted-foreground">{product.seller.storeName} · {product.category.name}</p>
                </div>
                <div className="font-semibold">{formatPrice(product.basePrice)}</div>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{product.shortDescription ?? product.description.slice(0, 180)}</p>
              <div className="flex gap-3">
                <form action="/api/admin/products" method="post">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="action" value="approve" />
                  <Button type="submit">Approve</Button>
                </form>
                <form action="/api/admin/products" method="post">
                  <input type="hidden" name="productId" value={product.id} />
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
