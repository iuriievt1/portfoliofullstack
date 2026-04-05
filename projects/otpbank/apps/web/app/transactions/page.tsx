"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { TransactionTable } from "../../components/transaction-table";
import { api } from "../../lib/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    api<any[]>("/transactions").then(setTransactions).catch(() => undefined);
  }, []);

  return (
    <AppShell title="Transactions">
      <TransactionTable transactions={transactions} />
    </AppShell>
  );
}
