import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listActivity } from "../../api/activity.js";
import { useOrgSocket } from "../../hooks/useOrgSocket.js";

const STAGES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["qualified", "Qualified"],
  ["proposal", "Proposal"],
  ["won", "Won"],
  ["lost", "Lost"]
];

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

export function DashboardPage() {
  const { org } = useOutletContext();
  const qc = useQueryClient();
  const [counts, setCounts] = useState({});

  useOrgSocket(org.id, () => {
    qc.invalidateQueries({ queryKey: ["activity", org.id] });
  });

  const activityQ = useQuery({
    queryKey: ["activity", org.id],
    queryFn: () => listActivity(org.id)
  });

  useEffect(() => {
    const es = new EventSource(`/api/metrics/stream?orgId=${encodeURIComponent(org.id)}`);
    es.addEventListener("metrics", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setCounts(payload.counts || {});
      } catch {}
    });
    return () => es.close();
  }, [org.id]);

  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + (b || 0), 0), [counts]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="text-lg font-semibold">{org.name}</div>
        <div className="mt-1 text-sm text-zinc-400">
          Live pipeline metrics (SSE) + realtime updates (Socket.IO). Total leads: <span className="text-zinc-200">{total}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STAGES.map(([k, label]) => (
            <StatCard key={k} title={label} value={counts[k] || 0} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-base font-semibold">Recent activity</div>
          <div className="mt-3 space-y-3">
            {activityQ.isLoading ? (
              <div className="text-sm text-zinc-400">Loading…</div>
            ) : (activityQ.data || []).length === 0 ? (
              <div className="text-sm text-zinc-400">No activity yet.</div>
            ) : (
              (activityQ.data || []).slice(0, 12).map((a) => (
                <div key={a.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                  <div className="text-sm">{a.message}</div>
                  <div className="mt-1 text-xs text-zinc-500">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-base font-semibold">Public lead capture</div>
          <div className="mt-2 text-sm text-zinc-400">
            Use your org public key to capture leads from any website form.
            Go to <b>Settings</b> to copy it.
          </div>

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm">
            <div className="font-semibold">Endpoint</div>
            <div className="mt-2 font-mono text-xs text-zinc-200 break-all">POST /api/public/lead</div>
            <div className="mt-3 font-semibold">Body</div>
            <pre className="mt-2 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-200">
{`{
  "publicKey": "lp_…",
  "name": "ACME s.r.o.",
  "email": "team@acme.cz",
  "message": "Need a quote"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
