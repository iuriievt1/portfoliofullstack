"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import type { CartItem, MenuItem } from "@/types";

type CartState = {
  items: CartItem[];
  add: (item: MenuItem) => void;
  dec: (menuItemId: number) => void;
  remove: (menuItemId: number) => void;
  setItemComment: (menuItemId: number, comment: string) => void;
  clear: () => void;
  totalCzk: number;
};

const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // ✅ SSR-safe: сначала пусто, потом подгружаем из localStorage на клиенте
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = storage.get("cart", [] as CartItem[]);
    setItems(saved);
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    storage.set("cart", next);
  };

  const add = (m: MenuItem) => {
    const next = [...items];
    const idx = next.findIndex((x) => x.menuItemId === m.id);
    if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    else next.push({ menuItemId: m.id, name: m.name, priceCzk: m.priceCzk, qty: 1 });
    persist(next);
  };

  const dec = (menuItemId: number) => {
    const next = items
      .map((x) => (x.menuItemId === menuItemId ? { ...x, qty: x.qty - 1 } : x))
      .filter((x) => x.qty > 0);
    persist(next);
  };

  const remove = (menuItemId: number) => {
    persist(items.filter((x) => x.menuItemId !== menuItemId));
  };

  const setItemComment = (menuItemId: number, comment: string) => {
    persist(items.map((x) => (x.menuItemId === menuItemId ? { ...x, comment } : x)));
  };

  const clear = () => persist([]);

  const totalCzk = useMemo(() => items.reduce((s, x) => s + x.priceCzk * x.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, add, dec, remove, setItemComment, clear, totalCzk }),
    [items, totalCzk]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
