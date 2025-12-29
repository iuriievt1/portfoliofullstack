import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { listLeads, createLead, updateLead } from "../../api/leads.js";
import { useOrgSocket } from "../../hooks/useOrgSocket.js";
import { SortableLeadCard } from "../shared/SortableLeadCard.jsx";

const STAGES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["qualified", "Qualified"],
  ["proposal", "Proposal"],
  ["won", "Won"],
  ["lost", "Lost"]
];

function Column({ stage, label, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${stage}` });

  return (
    <div
      ref={setNodeRef}
      className={[
        "rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition",
        isOver ? "ring-2 ring-zinc-600" : ""
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-zinc-500">{count}</div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function LeadsPage() {
  const { org } = useOutletContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");

  const leadsQ = useQuery({
    queryKey: ["leads", org.id],
    queryFn: () => listLeads(org.id)
  });

  // Realtime invalidation (Socket.IO)
  useOrgSocket(org.id, () => {
    qc.invalidateQueries({ queryKey: ["leads", org.id] });
  });

  const createM = useMutation({
    mutationFn: (payload) => createLead(org.id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads", org.id] })
  });

  const updateM = useMutation({
    mutationFn: ({ leadId, patch }) => updateLead(org.id, leadId, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads", org.id] })
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const all = leadsQ.data || [];
    if (!q) return all;
    return all.filter((l) =>
      [l.name, l.email, l.company, l.message]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [leadsQ.data, filter]);

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map(([k]) => [k, []]));
    for (const l of filtered) map[l.stage]?.push(l);
    return map;
  }, [filtered]);

  async function onCreate() {
    const name = window.prompt("Lead name?");
    if (!name) return;
    const email = window.prompt("Email (optional)") || "";
    await createM.mutateAsync({ name, email, stage: "new" });
  }

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const all = leadsQ.data || [];
    const activeLead = all.find((x) => x.id === activeId);
    if (!activeLead) return;

    // Dropped onto a column => update stage
    if (overId.startsWith("column:")) {
      const targetStage = overId.split(":")[1];
      if (targetStage && activeLead.stage !== targetStage) {
        updateM.mutate({ leadId: activeLead.id, patch: { stage: targetStage } });
      }
      return;
    }

    const overLead = all.find((x) => x.id === overId);
    if (!overLead) return;

    // If moved across columns => update stage
    if (activeLead.stage !== overLead.stage) {
      updateM.mutate({ leadId: activeLead.id, patch: { stage: overLead.stage } });
      return;
    }

    // Same column reorder (visual only)
    const stage = activeLead.stage;
    const stageIds = (byStage[stage] || []).map((l) => l.id);
    const oldIndex = stageIds.indexOf(activeId);
    const newIndex = stageIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    qc.setQueryData(["leads", org.id], (curr = []) => {
      const next = [...curr];
      const idxs = [];
      for (let i = 0; i < next.length; i += 1) {
        if (next[i].stage === stage) idxs.push(i);
      }
      const oldGlobal = idxs[oldIndex];
      const newGlobal = idxs[newIndex];
      if (oldGlobal == null || newGlobal == null) return curr;

      const [item] = next.splice(oldGlobal, 1);
      next.splice(newGlobal, 0, item);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="text-lg font-semibold">Leads</div>
          <div className="text-sm text-zinc-400">
            Drag cards between stages (realtime).
          </div>
        </div>

        <div className="sm:ml-auto flex gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search…"
            className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          />
          <button
            onClick={onCreate}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            + Lead
          </button>
        </div>
      </div>

      {leadsQ.isLoading ? (
        <div className="text-sm text-zinc-400">Loading…</div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {STAGES.map(([stage, label]) => {
              const ids = (byStage[stage] || []).map((l) => l.id);
              return (
                <Column key={stage} stage={stage} label={label} count={ids.length}>
                  <SortableContext items={ids} strategy={rectSortingStrategy}>
                    <div className="space-y-3">
                      {(byStage[stage] || []).map((lead) => (
                        <SortableLeadCard key={lead.id} lead={lead} />
                      ))}
                    </div>
                  </SortableContext>
                </Column>
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
}
