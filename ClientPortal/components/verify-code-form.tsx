"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/toast-provider";

export function VerifyCodeForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, code })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Ověření se nezdařilo.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ověření se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Kód se nepodařilo odeslat.");
      }

      toast.success("Nový ověřovací kód byl odeslán.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kód se nepodařilo odeslat.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      <div>
        <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Ověření účtu
        </span>
        <h2 className="mt-5 text-4xl font-semibold text-slate-950">Zadejte kód z e-mailu</h2>
        <p className="mt-3 text-sm text-slate-500">
          Pokud e-mail nedorazil, můžete si níže vyžádat nový ověřovací kód.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">E-mail</span>
        <input
          className="field"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Ověřovací kód</span>
        <input
          className="field text-center text-2xl tracking-[0.5em]"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D+/g, ""))}
          required
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Ověřování..." : "Ověřit a vstoupit"}
      </button>

      <button type="button" className="btn-secondary w-full" onClick={handleResend} disabled={resending}>
        {resending ? "Odesílání..." : "Poslat nový kód"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Chcete se vrátit?{" "}
        <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
          Přihlášení
        </Link>
      </p>
    </form>
  );
}
