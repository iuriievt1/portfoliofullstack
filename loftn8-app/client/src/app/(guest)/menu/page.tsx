"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { MenuResponse, MenuCategory, MenuItem, MenuSection } from "@/types";
import { useCart } from "@/providers/cart";
import { useToast } from "@/providers/toast";
import { RequireTable } from "@/components/RequireTable";

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-white/10 bg-white text-black"
          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Qty({
  qty,
  onMinus,
  onPlus,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  if (qty === 0) {
    return (
      <button
        type="button"
        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
        onClick={onPlus}
      >
        Добавить
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-1">
      <button
        type="button"
        className="h-9 w-9 rounded-xl border border-white/10 bg-black/30 text-white"
        onClick={onMinus}
        aria-label="Уменьшить"
      >
        −
      </button>
      <div className="w-6 text-center text-sm font-semibold text-white">{qty}</div>
      <button
        type="button"
        className="h-9 w-9 rounded-xl border border-white/10 bg-black/30 text-white"
        onClick={onPlus}
        aria-label="Увеличить"
      >
        +
      </button>
    </div>
  );
}

const SECTION_LABEL: Record<MenuSection, string> = {
  DISHES: "Блюда",
  DRINKS: "Напитки",
  HOOKAH: "Кальян",
};

function firstSection(categories: MenuCategory[]): MenuSection {
  return (categories[0]?.section as MenuSection) ?? "DISHES";
}

export default function Page() {
  return <MenuPage />;
}

function MenuPage() {
  const [data, setData] = useState<MenuResponse | null>(null);
  const [activeSection, setActiveSection] = useState<MenuSection>("DISHES");
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const { items, add, dec } = useCart();
  const { push } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const m = await api<MenuResponse>("/menu");
        setData(m);

        const sec = firstSection(m.categories ?? []);
        setActiveSection(sec);

        const firstCatInSec = (m.categories ?? []).find((c) => c.section === sec);
        setActiveCatId(firstCatInSec?.id ?? m.categories[0]?.id ?? null);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load menu");
      }
    };
    void load();
  }, []);

  const cats = useMemo(() => data?.categories ?? [], [data]);

  const catsBySection = useMemo(() => {
    const map = new Map<MenuSection, MenuCategory[]>();
    for (const c of cats) {
      const sec = c.section as MenuSection;
      map.set(sec, [...(map.get(sec) ?? []), c]);
    }
    return map;
  }, [cats]);

  const sectionCats = catsBySection.get(activeSection) ?? [];

  const activeCat = useMemo(() => {
    return sectionCats.find((c) => c.id === activeCatId) ?? sectionCats[0] ?? null;
  }, [sectionCats, activeCatId]);

  // если поменяли секцию — гарантируем валидную категорию
  useEffect(() => {
    if (!sectionCats.length) return;
    if (activeCatId && sectionCats.some((c) => c.id === activeCatId)) return;
    setActiveCatId(sectionCats[0].id);
  }, [activeSection, sectionCats, activeCatId]);

  const qtyById = useMemo(() => {
    const map = new Map<number, number>();
    for (const it of items) map.set(it.menuItemId, it.qty);
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    const list = activeCat?.items ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        (i.description ?? "").toLowerCase().includes(query)
    );
  }, [activeCat, q]);

  const onPlus = (i: MenuItem) => {
    add(i);
    push({
      kind: "success",
      title: "Добавлено",
      message: i.name,
      action: { label: "В корзину", href: "/cart" },
    });
  };

  const onMinus = (i: MenuItem) => {
    dec(i.id);
  };

  return (
    <RequireTable>
      <main className="mx-auto max-w-md px-4 pb-28 pt-5">
        <div className="mb-4">
          <div className="text-[11px] tracking-[0.28em] text-white/55">LOFT N8</div>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {data?.venue.name ?? "Меню"}
          </h1>
          <div className="mt-1 text-xs text-white/60">Заказывайте в 1–2 клика</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
            placeholder="Поиск по меню…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {err ? (
            <div className="mt-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-xs text-red-200">
              {err}
            </div>
          ) : null}

          {/* 1) Секции */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(["DISHES", "DRINKS", "HOOKAH"] as MenuSection[])
              .filter((s) => (catsBySection.get(s)?.length ?? 0) > 0)
              .map((s) => (
                <Pill
                  key={s}
                  active={s === activeSection}
                  onClick={() => {
                    setActiveSection(s);
                    setQ("");
                  }}
                >
                  {SECTION_LABEL[s]}
                </Pill>
              ))}
          </div>

          {/* 2) Категории внутри секции */}
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {sectionCats.map((c) => (
              <Pill
                key={c.id}
                active={c.id === activeCatId}
                onClick={() => {
                  setActiveCatId(c.id);
                  setQ("");
                }}
              >
                {c.name}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredItems.map((i) => {
            const qty = qtyById.get(i.id) ?? 0;

            return (
              <div
                key={i.id}
                className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{i.name}</div>
                    {i.description ? (
                      <div className="mt-1 text-xs text-white/65">{i.description}</div>
                    ) : null}

                    <div className="mt-3 inline-flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{i.priceCzk} Kč</span>
                      <span className="text-[11px] text-white/45">•</span>
                      <span className="text-[11px] text-white/55">включая сервис</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Qty qty={qty} onMinus={() => onMinus(i)} onPlus={() => onPlus(i)} />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Ничего не найдено.
            </div>
          ) : null}
        </div>
      </main>
    </RequireTable>
  );
}
