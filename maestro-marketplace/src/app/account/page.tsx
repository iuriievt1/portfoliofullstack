import { Bell, Package, Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default async function AccountOverviewPage() {
  const user = await requireUser();

  const [orders, wishlistCount, notifications] = await Promise.all([
    db.order.count({ where: { userId: user.id } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Account</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome back, {user.firstName}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="space-y-2 pt-6"><Package className="h-5 w-5 text-primary" /><div className="text-3xl font-semibold">{orders}</div><div className="text-sm text-muted-foreground">Orders placed</div></CardContent></Card>
        <Card><CardContent className="space-y-2 pt-6"><Heart className="h-5 w-5 text-primary" /><div className="text-3xl font-semibold">{wishlistCount}</div><div className="text-sm text-muted-foreground">Saved items</div></CardContent></Card>
        <Card><CardContent className="space-y-2 pt-6"><Bell className="h-5 w-5 text-primary" /><div className="text-3xl font-semibold">{notifications.length}</div><div className="text-sm text-muted-foreground">Recent notifications</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <div className="grid gap-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl bg-secondary p-4">
                <div className="font-medium">{notification.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
