"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@otpbank/ui";
import { AppShell } from "../../components/app-shell";
import { api } from "../../lib/api";

export default function SupportPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/support/users").then(setUsers).catch(() => undefined); }, []);
  return (
    <AppShell title="Support workspace">
      <div className="grid gap-4">
        {users.slice(0, 10).map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-950">{user.email}</div>
                <div className="text-sm text-slate-500">{user.status}</div>
              </div>
              <div className="text-xs text-slate-400">{user.roles.map((role: any) => role.role).join(", ")}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
