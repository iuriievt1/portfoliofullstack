"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/toast-provider";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          router.push(`/verify?email=${encodeURIComponent(email)}`);
        }

        throw new Error(payload.error ?? "Přihlášení se nezdařilo.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Přihlášení se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-6">
      <div>
        <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
          Přihlášení
        </span>
        <h2 className="mt-5 text-4xl font-semibold text-slate-950">Vítejte zpět</h2>
        <p className="mt-3 text-sm text-slate-500">
          Přihlaste se pomocí e-mailu a hesla. Sdílené složky i notifikace na vás počkají po přihlášení.
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
        <span className="mb-2 block text-sm font-medium text-slate-700">Heslo</span>
        <input
          className="field"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Přihlašování..." : "Přihlásit se"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Nemáte účet?{" "}
        <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-800">
          Registrovat se
        </Link>
      </p>
    </form>
  );
}
