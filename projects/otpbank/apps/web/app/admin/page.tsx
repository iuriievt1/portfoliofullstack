"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@otpbank/ui";
import { AppShell } from "../../components/app-shell";
import { api } from "../../lib/api";

export default function AdminPage() {
  const [ops, setOps] = useState<any | null>(null);
  useEffect(() => { api("/admin/operations").then(setOps).catch(() => undefined); }, []);
  return (
    <AppShell title="Admin operations">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent><div className="text-sm text-slate-500">Users</div><div className="text-2xl font-semibold">{ops?.users ?? "-"}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Transfers</div><div className="text-2xl font-semibold">{ops?.transfers ?? "-"}</div></CardContent></Card>
        <Card><CardContent><div className="text-sm text-slate-500">Open risk events</div><div className="text-2xl font-semibold">{ops?.riskOpen ?? "-"}</div></CardContent></Card>
      </div>
    </AppShell>
  );
}
