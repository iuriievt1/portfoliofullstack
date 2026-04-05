"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AccountCard } from "../../components/account-card";
import { api } from "../../lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>("/accounts").then(setAccounts).catch(() => undefined);
  }, []);

  return (
    <AppShell title="Accounts">
      <div className="grid gap-4 lg:grid-cols-2">
        {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
      </div>
    </AppShell>
  );
}
