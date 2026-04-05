"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, Input } from "@otpbank/ui";
import { AppShell } from "../../components/app-shell";
import { api } from "../../lib/api";

export default function TransferPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [form, setForm] = useState({ sourceAccountId: "", destinationAccountId: "", amountMinor: "10000", description: "Transfer demo", type: "INTERNAL" });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api<any[]>("/accounts"), api<any[]>("/beneficiaries")]).then(([a, b]) => {
      setAccounts(a);
      setBeneficiaries(b);
      setForm((prev) => ({
        ...prev,
        sourceAccountId: a[0]?.id ?? "",
        destinationAccountId: b[0]?.beneficiaryAccountId ?? a[1]?.id ?? ""
      }));
    }).catch(() => undefined);
  }, []);

  const source = useMemo(() => accounts.find((item) => item.id === form.sourceAccountId), [accounts, form.sourceAccountId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const result = await api<{ transfer: any }>("/transfers", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(form)
      });
      setStatus(`Transfer ${result.transfer.reference} -> ${result.transfer.status}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Transfer failed");
    }
  }

  return (
    <AppShell title="Transfer">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">New transfer</h2>
            <p className="mt-1 text-sm text-slate-500">All money-critical writes require an idempotency key.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Source account</label>
                <select className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.sourceAccountId} onChange={(e) => setForm((s) => ({ ...s, sourceAccountId: e.target.value }))}>
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.nickname} · {account.iban}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Destination account</label>
                <select className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.destinationAccountId} onChange={(e) => setForm((s) => ({ ...s, destinationAccountId: e.target.value }))}>
                  {beneficiaries.map((beneficiary) => <option key={beneficiary.id} value={beneficiary.beneficiaryAccountId}>{beneficiary.alias} · {beneficiary.beneficiaryAccount.iban}</option>)}
                  {accounts.filter((account) => account.id !== form.sourceAccountId).map((account) => <option key={account.id} value={account.id}>{account.nickname} · {account.iban}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Amount minor units</label>
                <Input value={form.amountMinor} onChange={(e) => setForm((s) => ({ ...s, amountMinor: e.target.value }))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <Button type="submit">Send transfer</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Confirmation</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Source</span><span>{source?.nickname ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Amount</span><span>{(Number(form.amountMinor) / 100).toFixed(2)} CZK</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Type</span><span>{form.type}</span></div>
            {status ? <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">{status}</div> : <div className="rounded-2xl bg-slate-50 px-3 py-2 text-slate-500">No submission yet.</div>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
