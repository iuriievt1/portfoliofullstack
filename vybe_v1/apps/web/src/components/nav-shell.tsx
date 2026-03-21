"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "../lib/utils";

const items = [
  { href: "/app/feed", label: "Live Feed" },
  { href: "/app/places", label: "Places" },
  { href: "/app/create", label: "Post" },
  { href: "/app/profile", label: "Profile" }
];

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-black tracking-tight">
            VYBE
          </Link>
          <nav className="hidden gap-2 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  pathname === item.href ? "bg-ink text-white" : "text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            className="text-sm font-semibold text-slate-600"
            onClick={() => {
              clearAuthSession();
              router.push("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

