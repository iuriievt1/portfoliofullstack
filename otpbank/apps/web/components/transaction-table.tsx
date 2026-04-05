"use client";

import { useMemo } from "react";

export function TransactionTable({ transactions }: { transactions: any[] }) {
  const rows = useMemo(() => transactions, [transactions]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Direction</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Booked</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">{tx.reference}</td>
              <td className="px-4 py-3">{tx.direction}</td>
              <td className="px-4 py-3">{(Number(tx.amountMinor) / 100).toFixed(2)} {tx.currency}</td>
              <td className="px-4 py-3 text-slate-500">{new Date(tx.bookedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
