"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/providers/toast";
import { useAuth } from "@/providers/auth";

type Mode = "login" | "register";
type Step = "phone" | "code";

function normalizePhone(x: string) {
  return x.replace(/\s+/g, "").trim();
}

function looksLike404(msg: string) {
  const m = (msg || "").toLowerCase();
  return m.includes("http_404") || m.includes("not_found") || m.includes("not found") || m.includes("404");
}

// tries multiple endpoints so you don't break anything if your backend path differs
async function tryPost(paths: string[], body: any) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      return await api(p, { method: "POST", body: JSON.stringify(body) });
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message ?? "");
      if (looksLike404(msg)) continue;
      throw e; // not 404 => real error
    }
  }
  throw lastErr ?? new Error("No auth endpoint matched");
}

export default function AuthPage() {
  const { push } = useToast();
  const { me, loading, refresh } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const p = useMemo(() => normalizePhone(phone), [phone]);
  const canSend = p.length >= 6 && !busy;
  const canVerify = code.trim().length >= 4 && !busy;

  useEffect(() => {
    if (loading) return;
    if (me?.authenticated) {
      // уже вошли -> в меню
      window.location.href = "/menu";
    }
  }, [loading, me]);

  const requestCode = async () => {
    setHint(null);
    if (!canSend) return;

    setBusy(true);
    try {
      const paths = [
        "/auth/guest/request-otp",
        "/auth/guest/request-code",
        "/auth/guest/send-otp",
        "/auth/guest/send-code",
        "/auth/guest/otp",
      ];

      const body: any = { phone: p };
      // registration extras (backend может игнорировать — ок)
      if (mode === "register") {
        if (name.trim()) body.name = name.trim();
        if (email.trim()) body.email = email.trim();
      }

      await tryPost(paths, body);

      setStep("code");
      setCode("");
      setHint("Код отправлен. Проверь SMS.");
      push({ kind: "success", title: "Код отправлен", message: "Проверь SMS и введи код ниже." });
    } catch (e: any) {
      push({ kind: "error", title: "Не удалось отправить код", message: e?.message ?? "Failed" });
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    setHint(null);
    if (!canVerify) return;

    setBusy(true);
    try {
      // разные бэки называют поле code/otp по-разному — пробуем оба
      const paths = [
        "/auth/guest/verify-otp",
        "/auth/guest/verify-code",
        "/auth/guest/confirm-otp",
        "/auth/guest/login",
      ];

      // 1) code
      try {
        await tryPost(paths, { phone: p, code: code.trim() });
      } catch (e1: any) {
        // 2) otp fallback
        await tryPost(paths, { phone: p, otp: code.trim() });
      }

      await refresh();
      push({ kind: "success", title: "Готово", message: "Вы вошли в систему." });
      window.location.href = "/menu";
    } catch (e: any) {
      push({ kind: "error", title: "Неверный код", message: e?.message ?? "Failed" });
    } finally {
      setBusy(false);
    }
  };

  const backToPhone = () => {
    setStep("phone");
    setCode("");
    setHint(null);
  };

  return (
    <main className="min-h-dvh bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-[0.35em] text-white/50">LOFT N8</div>
            <h1 className="mt-2 text-2xl font-semibold text-white">Регистрация / Вход</h1>
          </div>
          <Link href="/menu" className="text-sm text-white/70 underline underline-offset-4">
            В меню
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[rgba(20,20,20,0.72)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur">
          {/* mode switch */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[rgba(27,27,27,0.85)] p-1">
            <button
              onClick={() => setMode("login")}
              className={`h-10 rounded-xl text-sm font-semibold ${
                mode === "login" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("register")}
              className={`h-10 rounded-xl text-sm font-semibold ${
                mode === "register" ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* STEP: PHONE */}
          {step === "phone" ? (
            <>
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs text-white/60">Телефон</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+420 777 000 000"
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[rgba(27,27,27,0.9)] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                {mode === "register" ? (
                  <>
                    <div>
                      <label className="text-xs text-white/60">Имя</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[rgba(27,27,27,0.9)] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60">Email (опционально)</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[rgba(27,27,27,0.9)] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <button
                disabled={!canSend}
                onClick={requestCode}
                className="mt-4 h-12 w-full rounded-2xl bg-white text-sm font-semibold text-black disabled:opacity-50"
              >
                {busy ? "Отправляем…" : "Получить код"}
              </button>

              <div className="mt-3 text-xs text-white/45">
                В V1 бонусы начисляются после подтверждения оплаты персоналом.
              </div>
            </>
          ) : null}

          {/* STEP: CODE */}
          {step === "code" ? (
            <>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/60">Код из SMS</label>
                  <button
                    onClick={backToPhone}
                    className="text-xs text-white/70 underline underline-offset-4"
                    type="button"
                  >
                    Изменить номер
                  </button>
                </div>

                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="1234"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[rgba(27,27,27,0.9)] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />

                {hint ? <div className="mt-2 text-xs text-white/55">{hint}</div> : null}
              </div>

              <button
                disabled={!canVerify}
                onClick={verifyCode}
                className="mt-4 h-12 w-full rounded-2xl bg-white text-sm font-semibold text-black disabled:opacity-50"
              >
                {busy ? "Проверяем…" : "Войти"}
              </button>

              <button
                disabled={busy}
                onClick={requestCode}
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-transparent text-sm font-semibold text-white/80 hover:text-white disabled:opacity-50"
              >
                Отправить код ещё раз
              </button>

              <div className="mt-3 text-xs text-white/45">
                Код может приходить с небольшой задержкой. Если не пришёл — отправь ещё раз.
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
