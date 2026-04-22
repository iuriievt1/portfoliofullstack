"use client";

import { formatBytes, formatDate } from "@/lib/utils";
import type { ContentEntry } from "@/types";

type ContentTableProps = {
  entries: ContentEntry[];
  onOpenFolder: (folderId: string) => void;
  onDeleteEntry: (entry: ContentEntry) => void;
  onRenameFolder: (entry: ContentEntry) => void;
  readOnly?: boolean;
};

function EntryName({ entry, onOpenFolder }: { entry: ContentEntry; onOpenFolder: (folderId: string) => void }) {
  if (entry.kind === "folder") {
    return (
      <button
        type="button"
        onClick={() => onOpenFolder(entry.id)}
        className="font-semibold text-slate-900 hover:text-teal-700"
      >
        {entry.name}
      </button>
    );
  }

  if (entry.kind === "link" && entry.url) {
    return (
      <a href={entry.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-teal-700">
        {entry.name}
      </a>
    );
  }

  if (entry.kind === "file" && entry.storagePath) {
    return (
      <a
        href={entry.storagePath}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-slate-900 hover:text-teal-700"
      >
        {entry.name}
      </a>
    );
  }

  return <p className="font-semibold text-slate-900">{entry.name}</p>;
}

export function ContentTable({
  entries,
  onOpenFolder,
  onDeleteEntry,
  onRenameFolder,
  readOnly = false
}: ContentTableProps) {
  if (!entries.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
        Ve vybrané složce zatím nejsou žádné dokumenty, odkazy ani podsložky.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:hidden">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                {entry.kind === "folder" ? "📁" : entry.kind === "file" ? "📄" : "🔗"}
              </span>
              <div className="min-w-0 flex-1">
                <EntryName entry={entry} onOpenFolder={onOpenFolder} />
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {entry.kind === "folder" ? "Složka" : entry.kind === "file" ? "Soubor" : "Odkaz"}
                  </span>
                  {entry.category ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {entry.category}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {entry.kind === "file" ? formatBytes(Number(entry.sizeBytes ?? "0")) : "Bez velikosti"} ·{" "}
                  {formatDate(entry.createdAt)}
                </p>
                {entry.description ? (
                  <p className="mt-2 text-sm text-slate-500">{entry.description}</p>
                ) : entry.mimeType ? (
                  <p className="mt-2 text-sm text-slate-500">{entry.mimeType}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {entry.kind === "folder" ? (
                <>
                  <button type="button" onClick={() => onOpenFolder(entry.id)} className="btn-secondary px-3 py-2">
                    Otevřít
                  </button>
                  {!readOnly ? (
                    <button type="button" onClick={() => onRenameFolder(entry)} className="btn-secondary px-3 py-2">
                      Upravit
                    </button>
                  ) : null}
                </>
              ) : null}
              {!readOnly ? (
                <button type="button" onClick={() => onDeleteEntry(entry)} className="btn-danger px-3 py-2">
                  Smazat
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-white lg:block">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Název</th>
                <th className="px-6 py-4">Typ</th>
                <th className="px-6 py-4">Kategorie</th>
                <th className="px-6 py-4">Velikost</th>
                <th className="px-6 py-4">Vytvořeno</th>
                <th className="px-6 py-4 text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                        {entry.kind === "folder" ? "📁" : entry.kind === "file" ? "📄" : "🔗"}
                      </span>
                      <div>
                        <EntryName entry={entry} onOpenFolder={onOpenFolder} />
                        {entry.description ? (
                          <p className="mt-1 text-xs text-slate-500">{entry.description}</p>
                        ) : entry.mimeType ? (
                          <p className="mt-1 text-xs text-slate-500">{entry.mimeType}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry.kind === "folder" ? "Složka" : entry.kind === "file" ? "Soubor" : "Odkaz"}
                  </td>
                  <td className="px-6 py-4">
                    {entry.category ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {entry.category}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {entry.kind === "file" ? formatBytes(Number(entry.sizeBytes ?? "0")) : "—"}
                  </td>
                  <td className="px-6 py-4">{formatDate(entry.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {entry.kind === "folder" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenFolder(entry.id)}
                            className="btn-secondary px-3 py-2"
                          >
                            Otevřít
                          </button>
                          {!readOnly ? (
                            <button
                              type="button"
                              onClick={() => onRenameFolder(entry)}
                              className="btn-secondary px-3 py-2"
                            >
                              Upravit
                            </button>
                          ) : null}
                        </>
                      ) : null}
                      {!readOnly ? (
                        <button type="button" onClick={() => onDeleteEntry(entry)} className="btn-danger px-3 py-2">
                          Smazat
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
