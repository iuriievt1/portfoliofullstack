import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBranch, listBranches } from "../api/orgs.js";
import { listEvents } from "../api/ledger.js";
import { useOrgSocket } from "../hooks/useOrgSocket.js";

export default function BranchesPage({ ctx }) {
  const qc = useQueryClient();
  const org = ctx.org;

  const branchesQ = useQuery({
    queryKey: ["branches", org.id],
    queryFn: () => listBranches(org.id).then((r) => r.branches)
  });

  const [parentId, setParentId] = useState(() => ctx.branches?.[0]?.id || "");
  const [name, setName] = useState("whatif-1");
  const [baseEventId, setBaseEventId] = useState("");

  useOrgSocket(org.id, () => {
    qc.invalidateQueries({ queryKey: ["branches", org.id] });
    qc.invalidateQueries({ queryKey: ["parentEvents", org.id, parentId] });
  });

  const parentEventsQ = useQuery({
    queryKey: ["parentEvents", org.id, parentId],
    queryFn: () => listEvents(org.id, parentId),
    enabled: !!parentId
  });

  const createM = useMutation({
    mutationFn: (payload) => createBranch(org.id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches", org.id] })
  });

  const parentEvents = parentEventsQ.data?.events || [];

  const suggested = useMemo(() => {
    // suggest latest event as base
    if (!parentEvents.length) return "";
    return parentEvents[parentEvents.length - 1].id;
  }, [parentEvents]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Branches</div>
        <div className="text-sm text-zinc-400">
          Fork a new timeline from any event (“what‑if”). The new branch starts at <span className="font-mono">baseHash</span>.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-semibold">Create fork</div>

          <div className="mt-3 space-y-3">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Parent branch</div>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                {(branchesQ.data || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-zinc-400 mb-1">Base event (optional)</div>
              <select
                value={baseEventId}
                onChange={(e) => setBaseEventId(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                <option value="">(use parent head)</option>
                {parentEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {new Date(e.createdAt).toLocaleString()} · {e.type}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-zinc-500">
                Suggestion:{" "}
                <button
                  className="underline"
                  onClick={() => setBaseEventId(suggested)}
                >
                  latest event
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400 mb-1">New branch name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>

            <button
              disabled={createM.isPending || !name.trim() || !parentId}
              onClick={async () => {
                await createM.mutateAsync({
                  name: name.trim(),
                  parentBranchId: parentId,
                  baseEventId: baseEventId || undefined
                });
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
            >
              {createM.isPending ? "Creating…" : "Create fork"}
            </button>

            {createM.isError ? (
              <div className="text-sm text-red-400">{String(createM.error?.message || createM.error)}</div>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-semibold">All branches</div>
          <div className="mt-3 space-y-2">
            {(branchesQ.data || []).map((b) => (
              <div key={b.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="text-xs text-zinc-500">{new Date(b.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-400 font-mono break-all">
                  base: {String(b.baseHash || "GENESIS").slice(0, 18)}… &nbsp; head: {String(b.headHash || "GENESIS").slice(0, 18)}…
                </div>
                {b.parentBranchId ? (
                  <div className="mt-1 text-xs text-zinc-500">forked from: {b.parentBranchId}</div>
                ) : (
                  <div className="mt-1 text-xs text-zinc-500">root branch</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
