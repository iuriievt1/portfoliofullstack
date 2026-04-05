"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@otpbank/ui";
import { AppShell } from "../../components/app-shell";
import { api } from "../../lib/api";

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => { api<any[]>("/cards").then(setCards).catch(() => undefined); }, []);

  return (
    <AppShell title="Cards">
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id}>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-500">{card.account.nickname}</div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950">{card.maskedPan}</div>
              <div className="flex justify-between text-sm">
                <span>{card.brand}</span>
                <span>{card.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
