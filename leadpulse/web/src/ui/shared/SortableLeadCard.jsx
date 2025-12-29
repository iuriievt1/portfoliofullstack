import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableLeadCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-2xl border border-zinc-800 bg-zinc-950 p-3",
        isDragging ? "opacity-70" : ""
      ].join(" ")}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{lead.name}</div>
          <div className="truncate text-xs text-zinc-400">{lead.company || lead.email || "—"}</div>
        </div>
        <div className="shrink-0 text-xs text-zinc-500">
          {lead.value ? `€${lead.value}` : ""}
        </div>
      </div>

      {lead.message ? (
        <div className="mt-2 text-xs text-zinc-500">
          <div className="overflow-hidden text-ellipsis" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{lead.message}</div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(lead.tags || []).slice(0, 5).map((t) => (
          <span key={t} className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-2 py-0.5 text-[11px] text-zinc-300">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
