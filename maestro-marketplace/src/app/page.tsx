import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductGrid } from "@/components/product/product-grid";
import { getActivePromotions, getFeaturedProducts, getHeaderCategories, getMarketplaceStats } from "@/lib/services/catalog";

export default async function HomePage() {
  const [featuredProducts, categories, stats, promotions] = await Promise.all([
    getFeaturedProducts(),
    getHeaderCategories(),
    getMarketplaceStats(),
    getActivePromotions()
  ]);

  return (
    <div className="pb-24">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="space-y-8">
          <Badge className="w-fit">Premium multi-vendor commerce</Badge>
          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">Maestro is a launch-ready marketplace built for trust, speed, and elegant growth.</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">Premium storefront UX, seller onboarding, moderation, checkout, analytics, promotions, and scalable marketplace foundations in one production-grade platform.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/products"><Button size="lg">Explore catalog<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/seller/onboarding"><Button variant="outline" size="lg">Become a seller</Button></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="pt-6"><div className="text-3xl font-semibold">{stats.products}+</div><p className="mt-2 text-sm text-muted-foreground">Active catalog items</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-3xl font-semibold">{stats.sellers}+</div><p className="mt-2 text-sm text-muted-foreground">Verified sellers</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-3xl font-semibold">{stats.categories}</div><p className="mt-2 text-sm text-muted-foreground">Curated categories</p></CardContent></Card>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="overflow-hidden bg-primary text-primary-foreground"><CardContent className="grid gap-5 pt-6"><div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em]"><ShieldCheck className="h-4 w-4" />Trust-first marketplace</div><p className="text-2xl font-semibold">Seller onboarding, moderated listings, and payout-ready operations.</p></CardContent></Card>
          <Card><CardContent className="grid gap-5 pt-6"><div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-primary"><Store className="h-4 w-4" />Marketplace operations</div><p className="text-lg text-muted-foreground">Multi-vendor order routing, inventory awareness, coupon logic, analytics, and a clean admin command center.</p></CardContent></Card>
          <Card><CardContent className="grid gap-5 pt-6"><div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-primary"><Sparkles className="h-4 w-4" />Strong commercial design</div><p className="text-lg text-muted-foreground">White + green premium design language optimized for conversion and mobile-first use.</p></CardContent></Card>
        </div>
      </Container>

      <Container className="space-y-8 py-12">
        <SectionHeading eyebrow="Categories" title="Built for modern commerce verticals" description="Flexible enough for boutique design goods, wellness, home, specialty retail, and premium multi-brand commerce." />
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5">
              <div className="text-sm uppercase tracking-[0.15em] text-primary">Category</div>
              <div className="mt-3 text-2xl font-semibold">{category.name}</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>
      </Container>

      {promotions.length ? (
        <Container className="space-y-6 py-12">
          <SectionHeading eyebrow="Promotions" title="Active offers" description="Time-bound promotional blocks designed for homepage merchandising and campaign visibility." />
          <div className="grid gap-4 md:grid-cols-3">
            {promotions.map((promotion) => (
              <Card key={promotion.id} className="bg-secondary">
                <CardContent className="space-y-4 pt-6">
                  <div className="text-sm uppercase tracking-[0.15em] text-primary">{promotion.type.replace("_", " ")}</div>
                  <div className="text-2xl font-semibold">{promotion.title}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{promotion.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="space-y-8 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Featured" title="High-converting products" description="Curated listings with elegant presentation, trust signals, and direct add-to-cart flow." />
          <Link href="/products" className="text-sm font-medium text-primary">View all products</Link>
        </div>
        <ProductGrid products={featuredProducts} />
      </Container>
    </div>
  );
}
