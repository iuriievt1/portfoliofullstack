"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AccountCard } from "../../components/account-card";
import { StatCard } from "../../components/stat-card";
import { TransactionTable } from "../../components/transaction-table";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api<any[]>("/accounts"), api<any[]>("/transactions")]).then(([a, t]) => {
      setAccounts(a);
      setTransactions(t.slice(0, 10));
    }).catch(() => undefined);
  }, []);

  const total = accounts.reduce((sum, item) => sum + Number(item.availableBalanceMinor), 0);

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total available" value={`${(total / 100).toFixed(2)} CZK`} hint="Denormalized account balance, synchronized with ledger postings." />
        <StatCard label="Open accounts" value={String(accounts.length)} />
        <StatCard label="Recent transactions" value={String(transactions.length)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
      </div>
      <TransactionTable transactions={transactions} />
    </AppShell>
  );
}
