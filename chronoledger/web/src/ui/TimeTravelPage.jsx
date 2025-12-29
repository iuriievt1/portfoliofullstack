import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listBranches } from "../api/orgs.js";
import { getState } from "../api/ledger.js";
import { useOrgSocket } from "../hooks/useOrgSocket.js";

const COLS = [
  ["backlog", "Backlog"],
  ["doing", "Doing"],
  ["review", "Review"],
  ["done", "Done"]
];

function Column({ title, children }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Card({ c }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
      <div className="text-sm font-semibold">{c.title}</div>
      <div className="mt-1 text-xs text-zinc-500">{c.id}</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {(c.tags || []).map((t) => (
          <span key={t} className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TimeTravelPage({ ctx }) {
  const qc = useQueryClient();
  const org = ctx.org;

  const branchesQ = useQuery({
    queryKey: ["branches", org.id],
    queryFn: () => listBranches(org.id).then((r) => r.branches)
  });

  const [branchId, setBranchId] = useState(() => ctx.branches?.[0]?.id || "");
  const [at, setAt] = useState("");

  useOrgSocket(org.id, () => {
    qc.invalidateQueries({ queryKey: ["state", org.id, branchId, at] });
  });

  const stateQ = useQuery({
    queryKey: ["state", org.id, branchId, at],
    queryFn: () => getState(org.id, branchId, at ? new Date(at).toISOString() : null),
    enabled: !!branchId
  });

  const cards = useMemo(() => {
    const map = stateQ.data?.state?.cards || {};
    const list = Object.values(map).filter((c) => !c.archived);
    return list;
  }, [stateQ.data]);

  const grouped = useMemo(() => {
    const g = { backlog: [], doing: [], review: [], done: [] };
    for (const c of cards) g[c.status]?.push(c);
    return g;
  }, [cards]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-lg font-semibold">Time Travel</div>
          <div className="text-sm text-zinc-400">
            Reconstruct the board at any timestamp by replaying events.
          </div>
        </div>

        <div className="sm:ml-auto flex flex-col sm:flex-row gap-2">
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

          <input
            type="datetime-local"
            value={at}
            onChange={(e) => setAt(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Leave the time empty = current state. Pick a past time = watch the board “rewind”.
      </div>

      {stateQ.isLoading ? (
        <div className="text-sm text-zinc-400">Loading…</div>
      ) : stateQ.isError ? (
        <div className="text-sm text-red-400">{String(stateQ.error?.message || stateQ.error)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLS.map(([key, label]) => (
            <Column key={key} title={`${label} · ${grouped[key].length}`}>
              {grouped[key].map((c) => (
                <Card key={c.id} c={c} />
              ))}
            </Column>
          ))}
        </div>
      )}
    </div>
  );
}
