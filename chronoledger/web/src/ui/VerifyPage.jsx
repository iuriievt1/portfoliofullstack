import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBranches } from "../api/orgs.js";
import { verifyBranch } from "../api/ledger.js";

export default function VerifyPage({ ctx }) {
  const org = ctx.org;

  const branchesQ = useQuery({
    queryKey: ["branches", org.id],
    queryFn: () => listBranches(org.id).then((r) => r.branches)
  });

  const [branchId, setBranchId] = useState(() => ctx.branches?.[0]?.id || "");

  const verifyQ = useQuery({
    queryKey: ["verify", org.id, branchId],
    queryFn: () => verifyBranch(org.id, branchId),
    enabled: !!branchId
  });

  const v = verifyQ.data;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Verify integrity</div>
        <div className="text-sm text-zinc-400">
          Server recomputes hashes and checks the whole chain (tamper‑evident ledger).
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
        >
          {(branchesQ.data || []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}{b.parentBranchId ? " (fork)" : ""}
            </option>
          ))}
        </select>

        <button
          onClick={() => verifyQ.refetch()}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
        >
          Re-check
        </button>
      </div>

      {verifyQ.isLoading ? (
        <div className="text-sm text-zinc-400">Checking…</div>
      ) : verifyQ.isError ? (
        <div className="text-sm text-red-400">{String(verifyQ.error?.message || verifyQ.error)}</div>
      ) : v ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-semibold">
            {v.ok ? "✅ Chain valid" : "❌ Chain invalid"}
          </div>

          <pre className="mt-3 text-xs text-zinc-300 whitespace-pre-wrap break-words">
{JSON.stringify(v, null, 2)}
          </pre>

          <div className="mt-3 text-xs text-zinc-500">
            Idea for interviews: explain why a hash‑chain + event‑sourcing makes audits + debugging dramatically easier.
          </div>
        </div>
      ) : null}
    </div>
  );
}
