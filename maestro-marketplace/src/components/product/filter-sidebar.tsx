import Link from "next/link";
import { sortOptions } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FilterSidebar({ current }: { current: Record<string, string | undefined> }) {
  return (
    <form action="/products" className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Search</label>
          <Input name="q" placeholder="Candle, decor, diffuser..." defaultValue={current.q} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Category slug</label>
          <Input name="category" placeholder="home" defaultValue={current.category} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium">Min price</label>
            <Input name="min" type="number" defaultValue={current.min} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Max price</label>
            <Input name="max" type="number" defaultValue={current.max} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Minimum rating</label>
          <Input name="rating" type="number" min="1" max="5" defaultValue={current.rating} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Sort</label>
          <select name="sort" defaultValue={current.sort || "featured"} className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <Button type="submit" className="w-full">Apply filters</Button>
        <Link href="/products" className="block text-center text-sm font-medium text-muted-foreground">
          Reset filters
        </Link>
      </div>
    </form>
  );
}
