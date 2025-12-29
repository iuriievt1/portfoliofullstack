import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { listBranches } from "../api/orgs.js";
import { appendEvent, listEvents } from "../api/ledger.js";
import { useOrgSocket } from "../hooks/useOrgSocket.js";

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

const STATUSES = ["backlog", "doing", "review", "done"];

export default function TimelinePage({ ctx }) {
  const qc = useQueryClient();
  const org = ctx.org;

  const branchesQ = useQuery({
    queryKey: ["branches", org.id],
    queryFn: () => listBranches(org.id).then((r) => r.branches)
  });

  const [branchId, setBranchId] = useState(() => ctx.branches?.[0]?.id || "");
  const branch = useMemo(() => (branchesQ.data || []).find((b) => b.id === branchId), [branchesQ.data, branchId]);

  useOrgSocket(org.id, () => {
    qc.invalidateQueries({ queryKey: ["events", org.id, branchId] });
    qc.invalidateQueries({ queryKey: ["branches", org.id] });
  });

  const eventsQ = useQuery({
    queryKey: ["events", org.id, branchId],
    queryFn: () => listEvents(org.id, branchId),
    enabled: !!branchId
  });

  const appendM = useMutation({
    mutationFn: (payload) => appendEvent(org.id, branchId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", org.id, branchId] })
  });

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("backlog");
  const [tags, setTags] = useState("demo");

  const events = eventsQ.data?.events || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-lg font-semibold">Timeline</div>
          <div className="text-sm text-zinc-400">
            Every action is an event with <span className="text-zinc-200">prevHash → hash</span> (tamper‑evident).
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
          <div className="text-xs text-zinc-500 self-center">
            head: <span className="font-mono">{branch?.headHash?.slice(0, 10) || "—"}…</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="text-sm font-semibold">Append an event</div>
          <div className="mt-3 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title…"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            />

            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tags (comma)…"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>

            <button
              disabled={appendM.isPending || !title.trim()}
              onClick={async () => {
                const id = "card_" + Math.random().toString(16).slice(2);
                await appendM.mutateAsync({
                  type: "CARD_CREATED",
                  payload: { id, title: title.trim(), status, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) }
                });
                setTitle("");
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
            >
              Create card (event)
            </button>

            <div className="text-xs text-zinc-500">
              Tip: open a second tab and create/move cards — updates should arrive instantly (Socket.IO).
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Events</div>
            <div className="text-xs text-zinc-500">
              {eventsQ.isLoading ? "loading…" : `${events.length} events`}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {(events || []).slice().reverse().map((e) => (
              <div key={e.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{e.type}</div>
                  <div className="text-xs text-zinc-500">{fmt(e.createdAt)}</div>
                </div>
                <div className="mt-2 text-xs text-zinc-400 font-mono break-all">
                  prev: {String(e.prevHash).slice(0, 16)}… &nbsp; hash: {String(e.hash).slice(0, 16)}…
                </div>
                <pre className="mt-2 text-xs text-zinc-300 whitespace-pre-wrap break-words">
{JSON.stringify(e.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
