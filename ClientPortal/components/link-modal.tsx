"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";

type LinkModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: (payload: { name: string; url: string; description: string }) => Promise<void>;
};

export function LinkModal({ open, onClose, onSaved }: LinkModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      return;
    }

    setName("");
    setUrl("");
    setDescription("");
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await onSaved({ name, url, description });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uložení odkazu se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Přidat odkaz"
      description="Uložte externí URL s popisem přímo do vybrané složky."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Název</span>
          <input
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">URL</span>
          <input
            className="field"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Popis</span>
          <textarea
            className="field min-h-28 resize-none"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Zrušit
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Ukládání..." : "Přidat odkaz"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
