import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default async function SellerPromotionsPage() {
  const user = await requireUser();
  const seller = await db.sellerProfile.findUnique({ where: { userId: user.id } });
  if (!seller) redirect("/seller/onboarding");

  const promotions = await db.promotion.findMany({
    where: { sellerId: seller.id },
    orderBy: { startsAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Promotions</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Campaigns and offers</h1>
      </div>
      <div className="grid gap-4">
        {promotions.length ? promotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardContent className="space-y-2 pt-6">
              <div className="text-lg font-semibold">{promotion.title}</div>
              <div className="text-sm text-muted-foreground">{promotion.description}</div>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="pt-6 text-muted-foreground">No seller-specific promotions yet. Create campaigns through admin tooling or seed flows.</CardContent></Card>}
      </div>
    </div>
  );
}
