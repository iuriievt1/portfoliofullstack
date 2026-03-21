import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Coupons</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Discount management</h1>
      </div>
      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardContent className="space-y-2 pt-6">
              <div className="text-lg font-semibold">{coupon.code}</div>
              <p className="text-sm text-muted-foreground">{coupon.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
