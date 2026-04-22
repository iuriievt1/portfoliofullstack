"use client";

import type { FolderRecord } from "@/types";
import { cn, formatDate } from "@/lib/utils";

type FolderSidebarProps = {
  folders: FolderRecord[];
  selectedFolderId: string | null;
  onSelect: (folderId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  loading?: boolean;
};

export function FolderSidebar({
  folders,
  selectedFolderId,
  onSelect,
  search,
  onSearchChange,
  sort,
  onSortChange,
  loading = false
}: FolderSidebarProps) {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));

  function getDepth(folder: FolderRecord) {
    let depth = 0;
    let current = folder;

    while (current.parentId) {
      const parent = byId.get(current.parentId);
      if (!parent) {
        break;
      }

      depth += 1;
      current = parent;
    }

    return depth;
  }

  const groupedFolders = folders.reduce<Record<string, FolderRecord[]>>((accumulator, folder) => {
    const key = folder.category?.trim() || "Bez kategorie";
    accumulator[key] ??= [];
    accumulator[key].push(folder);
    return accumulator;
  }, {});

  const orderedGroups = Object.entries(groupedFolders).sort(([left], [right]) =>
    left.localeCompare(right, "cs")
  );

  return (
    <aside className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-5">
        <h2 className="text-lg font-semibold text-slate-950">Složky a kategorie</h2>
        <p className="mt-1 text-sm text-slate-500">
          Najděte správnou složku a otevřete ji jedním kliknutím.
        </p>
      </div>

      <div className="space-y-3 border-b border-slate-200 px-5 py-5">
        <input
          className="field"
          placeholder="Hledat podle názvu nebo kategorie"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <select className="field" value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="alphabetical">Seřadit abecedně</option>
          <option value="newest">Seřadit od nejnovějších</option>
          <option value="oldest">Seřadit od nejstarších</option>
        </select>
      </div>

      <div className="scrollbar-thin max-h-[70vh] overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Načítání složek...
          </div>
        ) : null}

        <div className="space-y-5">
          {orderedGroups.map(([category, groupFolders]) => (
            <section key={category} className="space-y-2">
              <div className="flex items-center justify-between gap-3 px-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {category}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                  {groupFolders.length}
                </span>
              </div>

              <div className="space-y-2">
                {groupFolders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => onSelect(folder.id)}
                    className={cn(
                      "w-full rounded-[1.5rem] border px-4 py-3 text-left transition",
                      selectedFolderId === folder.id
                        ? "border-teal-200 bg-teal-50"
                        : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                    )}
                    style={{ marginLeft: `${Math.min(getDepth(folder) * 10, 36)}px` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{folder.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {folder.sharedBy
                            ? `Sdílel ${folder.sharedBy.name} · ${formatDate(folder.createdAt)}`
                            : formatDate(folder.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                        {folder.childrenCount + folder.itemsCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}

          {!folders.length ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              Žádná složka neodpovídá hledání.
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
