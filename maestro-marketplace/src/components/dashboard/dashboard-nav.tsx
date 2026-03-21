import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardNav({
  items,
  pathname
}: {
  items: Array<{ href: string; label: string }>;
  pathname: string;
}) {
  return (
    <nav className="grid gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("rounded-2xl px-4 py-3 text-sm font-medium transition", active ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
