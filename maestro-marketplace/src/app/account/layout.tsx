import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <Container className="grid gap-8 py-14 lg:grid-cols-[240px_1fr]">
      <aside className="grid gap-2 lg:h-fit">
        <Link href="/account"><Button variant="secondary" className="w-full justify-start">Overview</Button></Link>
        <Link href="/account/orders"><Button variant="secondary" className="w-full justify-start">Orders</Button></Link>
        <Link href="/account/wishlist"><Button variant="secondary" className="w-full justify-start">Wishlist</Button></Link>
      </aside>
      <div>{children}</div>
    </Container>
  );
}
