"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@otpbank/ui";
import { AppShell } from "../../components/app-shell";
import { api } from "../../lib/api";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/documents").then(setDocuments).catch(() => undefined); }, []);

  return (
    <AppShell title="Documents">
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-950">{doc.title}</div>
                <div className="text-sm text-slate-500">{doc.type}</div>
              </div>
              <div className="text-xs text-slate-400">{doc.storageKey}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
