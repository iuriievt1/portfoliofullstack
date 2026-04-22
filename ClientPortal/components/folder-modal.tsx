"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";
import type { FolderRecord } from "@/types";

type FolderModalProps = {
  open: boolean;
  mode: "create" | "rename";
  folders: FolderRecord[];
  selectedFolderId: string | null;
  currentFolderName?: string;
  currentCategoryName?: string;
  categorySuggestions: string[];
  onClose: () => void;
  onSaved: (payload: { name: string; parentId: string | null; category: string | null }) => Promise<void>;
};

export function FolderModal({
  open,
  mode,
  folders,
  selectedFolderId,
  currentFolderName,
  currentCategoryName,
  categorySuggestions,
  onClose,
  onSaved
}: FolderModalProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(currentFolderName ?? "");
    setCategory(currentCategoryName ?? "");
    setParentId(mode === "create" ? selectedFolderId ?? "" : "");
  }, [open, currentFolderName, currentCategoryName, mode, selectedFolderId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await onSaved({
        name,
        parentId: parentId || null,
        category: category.trim() || null
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uložení složky se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Nová složka" : "Upravit složku"}
      description={
        mode === "create"
          ? "Zadejte název, vlastní kategorii a případně vyberte nadřazenou složku."
          : "Upravte název a kategorii vybrané složky."
      }
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Název složky</span>
          <input
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Kategorie</span>
          <input
            className="field"
            list="folder-categories"
            placeholder="Například Klienti, Podání, Smlouvy"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <datalist id="folder-categories">
            {categorySuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          {categorySuggestions.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {categorySuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </label>

        {mode === "create" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Nadřazená složka</span>
            <select className="field" value={parentId} onChange={(event) => setParentId(event.target.value)}>
              <option value="">Bez nadřazené složky</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Zrušit
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Ukládání..." : mode === "create" ? "Vytvořit složku" : "Uložit změny"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
