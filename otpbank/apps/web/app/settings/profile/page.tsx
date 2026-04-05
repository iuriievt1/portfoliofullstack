"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, Input } from "@otpbank/ui";
import { AppShell } from "../../../components/app-shell";
import { api } from "../../../lib/api";

export default function ProfileSettingsPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", city: "", postalCode: "", countryCode: "CZ" });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    api<any>("/users/me").then((user) => setForm({
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      city: user.profile?.city ?? "",
      postalCode: user.profile?.postalCode ?? "",
      countryCode: user.profile?.countryCode ?? "CZ"
    })).catch(() => undefined);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api("/users/me", { method: "PATCH", body: JSON.stringify(form) });
    setStatus("Saved");
  }

  return (
    <AppShell title="Profile settings">
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Personal details</h2></CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
            <Input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} />
            <Input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
            <Input value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
            <Input value={form.postalCode} onChange={(e) => setForm((s) => ({ ...s, postalCode: e.target.value }))} />
            <Input value={form.countryCode} onChange={(e) => setForm((s) => ({ ...s, countryCode: e.target.value }))} />
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit">Save profile</Button>
              {status ? <span className="text-sm text-emerald-700">{status}</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
