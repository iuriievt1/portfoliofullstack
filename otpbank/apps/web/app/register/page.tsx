"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, Input } from "@otpbank/ui";
import { api } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "Demo",
    lastName: "Customer",
    email: "newuser@otpbank.local",
    password: "OtpbankDemo123!"
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-xl font-semibold text-slate-950">Open an OTPBank profile</h1>
          <p className="mt-1 text-sm text-slate-500">KYC and provider flows stay mockable until real integrations are attached.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <Input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} placeholder="First name" />
            <Input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} placeholder="Last name" />
            <div className="md:col-span-2"><Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" /></div>
            <div className="md:col-span-2"><Input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Password" /></div>
            {error ? <div className="md:col-span-2 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating..." : "Create account"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
