"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/transfer", label: "Transfer" },
  { href: "/cards", label: "Cards" },
  { href: "/documents", label: "Documents" },
  { href: "/settings/profile", label: "Settings" },
  { href: "/admin", label: "Admin" },
  { href: "/support", label: "Support" }
];

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white">OT</div>
            <div>
              <div className="font-semibold text-slate-950">OTPBank</div>
              <div className="text-xs text-slate-500">Digital banking</div>
            </div>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`block rounded-2xl px-3 py-2 text-sm transition ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">Bank-grade UX shell with role-aware navigation and money-movement controls.</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Protected area</div>
            </div>
          </motion.div>
          {children}
        </main>
      </div>
    </div>
  );
}
