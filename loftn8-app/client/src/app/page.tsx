"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PilotEntryPage() {
  const sp = useSearchParams();
  const tableFromUrl = sp.get("table") ?? "";
  const [table, setTable] = useState(tableFromUrl);

  const normalized = useMemo(() => table.trim(), [table]);

  // Если пришли по QR на /?table=T12 — сразу в меню
  useEffect(() => {
    if (!tableFromUrl) return;
    window.location.href = `/menu?table=${encodeURIComponent(tableFromUrl)}`;
  }, [tableFromUrl]);

  const go = () => {
    const t = normalized || "T1";
    window.location.href = `/menu?table=${encodeURIComponent(t)}`;
  };

  return (
    <main className="min-h-dvh bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-4 text-center">
          <div className="text-[11px] tracking-[0.35em] text-white/50">LOFT N8</div>
          <h1 className="mt-2 text-2xl font-semibold text-white">Pilot entry</h1>
          <p className="mt-1 text-sm text-white/55">
            В проде это будет открываться по QR: <span className="text-white/70">/?table=T12</span>
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[rgba(20,20,20,0.72)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur">
          <label className="text-xs text-white/60">Table code</label>

          <div className="mt-2 flex gap-2">
            <input
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="Например: T12"
              className="h-12 w-full rounded-2xl border border-white/10 bg-[rgba(27,27,27,0.9)] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
              inputMode="text"
            />
            <button
              onClick={go}
              className="h-12 shrink-0 rounded-2xl bg-white px-5 text-sm font-semibold text-black hover:opacity-95 active:opacity-90"
            >
              Enter
            </button>
          </div>

          <div className="mt-3 text-xs text-white/45">
            Если таблица не указана — по умолчанию откроем <b className="text-white/65">T1</b>.
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <Link href="/menu" className="text-white/70 underline underline-offset-4">
              В меню без QR
            </Link>
            <Link href="/auth" className="text-white/70 underline underline-offset-4">
              Вход / Регистрация
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
