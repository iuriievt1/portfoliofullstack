"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/toast-provider";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          consent
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Registrace se nezdařila.");
      }

      toast.success("Ověřovací kód byl odeslán na e-mail.");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registrace se nezdařila.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      <div>
        <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Registrace
        </span>
        <h2 className="mt-5 text-4xl font-semibold text-slate-950">Vytvořit účet</h2>
        <p className="mt-3 text-sm text-slate-500">
          Zadejte jméno, e-mail a heslo. Po odeslání přijde ověřovací kód na e-mail.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Jméno a příjmení</span>
        <input className="field" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Heslo</span>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Potvrdit heslo</span>
          <input
            className="field"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700"
        />
        <span>Souhlasím se zpracováním osobních údajů pro účely provozu klientského portálu.</span>
      </label>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Odesílání..." : "Vytvořit účet"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Už máte účet?{" "}
        <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
          Přihlásit se
        </Link>
      </p>
    </form>
  );
}
