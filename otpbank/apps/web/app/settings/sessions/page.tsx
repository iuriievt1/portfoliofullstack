"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent } from "@otpbank/ui";
import { AppShell } from "../../../components/app-shell";
import { api } from "../../../lib/api";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);

  async function load() {
    const data = await api<any[]>("/users/sessions");
    setSessions(data);
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  async function revoke(id: string) {
    await api(`/users/sessions/${id}/revoke`, { method: "POST" });
    await load();
  }

  return (
    <AppShell title="Sessions">
      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-950">{session.deviceName ?? "Browser session"}</div>
                <div className="text-sm text-slate-500">{session.ipAddress ?? "Unknown IP"} · {session.status}</div>
              </div>
              <Button variant="secondary" onClick={() => revoke(session.id)}>Revoke</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
