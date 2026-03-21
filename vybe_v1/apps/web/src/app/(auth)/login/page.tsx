"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../services/api";
import { setAuthSession } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await api.login({ email, password });
      setAuthSession(response.accessToken, JSON.stringify(response.user));
      router.push("/app/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[32px] bg-white/90 p-8 shadow-soft">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to see what Prague feels like right now.</p>
        <div className="mt-8 space-y-4">
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full">
          Sign in
        </Button>
        <p className="mt-4 text-sm text-slate-500">
          New here? <Link href="/register" className="font-semibold text-ink">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

