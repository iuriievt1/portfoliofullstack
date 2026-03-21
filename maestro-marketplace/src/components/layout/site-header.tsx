import Link from "next/link";
import { ShoppingBag, Store, ShieldCheck, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getHeaderCategories } from "@/lib/services/catalog";
import { APP_NAME, mainNavigation } from "@/lib/constants";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const [user, categories] = await Promise.all([getCurrentUser(), getHeaderCategories()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-primary">{APP_NAME}</Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {mainNavigation.map((item) => <Link key={item.href} href={item.href} className="text-sm font-medium">{item.label}</Link>)}
            <div className="hidden items-center gap-4 xl:flex">
              {categories.slice(0, 4).map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="text-sm text-muted-foreground transition hover:text-foreground">
                  {category.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/cart"><Button variant="outline" size="icon" aria-label="Cart"><ShoppingBag className="h-4 w-4" /></Button></Link>
          {user?.role === "SELLER" || user?.sellerProfile ? <Link href="/seller"><Button variant="outline" size="icon" aria-label="Seller dashboard"><Store className="h-4 w-4" /></Button></Link> : null}
          {user?.role === "ADMIN" ? <Link href="/admin"><Button variant="outline" size="icon" aria-label="Admin panel"><ShieldCheck className="h-4 w-4" /></Button></Link> : null}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/account"><Button variant="secondary"><User className="mr-2 h-4 w-4" />{user.firstName}</Button></Link>
              <form action="/api/auth/logout" method="post">
                <Button type="submit" variant="outline">Sign out</Button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/auth/sign-in"><Button variant="outline">Sign in</Button></Link>
              <Link href="/auth/sign-up" className="hidden sm:block"><Button>Create account</Button></Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
