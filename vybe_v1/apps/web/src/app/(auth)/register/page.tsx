"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../services/api";
import { setAuthSession } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "", city: "Prague" });
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await api.register(form);
      setAuthSession(response.accessToken, JSON.stringify(response.user));
      router.push("/app/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[32px] bg-white/90 p-8 shadow-soft">
        <h1 className="text-3xl font-black">Create your VYBE</h1>
        <p className="mt-2 text-sm text-slate-500">Start sharing what places feel like right now.</p>
        <div className="mt-8 space-y-4">
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full">
          Create account
        </Button>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-semibold text-ink">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

