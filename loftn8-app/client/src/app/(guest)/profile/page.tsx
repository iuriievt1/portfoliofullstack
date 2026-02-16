"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth";
import { api } from "@/lib/api";
import { useToast } from "@/providers/toast";

export default function ProfilePage() {
  const { loading, me, refresh } = useAuth();
  const { push } = useToast();

  const logout = async () => {
    try {
      await api("/auth/guest/logout", { method: "POST" });
      await refresh();
      push({ kind: "success", title: "Вы вышли" });
      window.location.href = "/menu";
    } catch (e: any) {
      push({ kind: "error", title: "Ошибка", message: e?.message ?? "Failed" });
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-5">
      <div className="mb-4">
        <div className="text-[11px] tracking-[0.28em] text-white/55">LOFT N8</div>
        <h1 className="mt-1 text-2xl font-bold text-white">Профиль</h1>
        <div className="mt-1 text-xs text-white/60">Бонусы и история (Pilot)</div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        {loading ? (
          <div className="text-sm text-white/70">Загрузка…</div>
        ) : me.authenticated ? (
          <>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/30 text-white">
                <span className="text-sm font-bold">{me.user.name?.[0]?.toUpperCase() ?? "U"}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-white/60">Вы вошли как</div>
                <div className="text-lg font-semibold text-white">{me.user.name}</div>
                <div className="mt-0.5 text-xs text-white/60">{me.user.phone}</div>
                <div className="text-xs text-white/60">{me.user.email}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-sm font-semibold text-white">Бонусы / Cashback</div>
              <div className="mt-1 text-sm text-white/80">
                Баланс: <b>0 Kč</b> (Pilot)
              </div>
              <div className="mt-1 text-xs text-white/55">
                Начисление происходит после подтверждения оплаты персоналом (Block 2).
              </div>
            </div>

            <button
              className="mt-4 w-full rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
              onClick={logout}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <div className="text-sm text-white/80">Вы не зарегистрированы.</div>
            <Link
              href="/auth"
              className="mt-3 block w-full rounded-3xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
            >
              Регистрация / Вход
            </Link>
          </>
        )}
      </div>

      <div className="mt-4 rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div className="text-sm font-semibold text-white">Отзывы</div>
        <div className="mt-1 text-xs text-white/65">
          Оставьте отзыв в Google — это помогает заведению.
        </div>

        <a
          className="mt-3 block w-full rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("В V1: сюда подставим Google Review link заведения");
          }}
        >
          Оставить отзыв в Google
        </a>
      </div>
    </main>
  );
}
