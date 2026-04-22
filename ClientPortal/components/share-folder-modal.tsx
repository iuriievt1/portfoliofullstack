"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast-provider";

type ShareFolderModalProps = {
  open: boolean;
  folderName: string;
  onClose: () => void;
  onShared: (recipientPublicId: string) => Promise<void>;
};

export function ShareFolderModal({
  open,
  folderName,
  onClose,
  onShared
}: ShareFolderModalProps) {
  const toast = useToast();
  const [recipientPublicId, setRecipientPublicId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setRecipientPublicId("");
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await onShared(recipientPublicId.trim());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sdílení složky se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Sdílet složku"
      description={`Vybraná složka „${folderName}“ bude zpřístupněna uživateli podle jeho ID.`}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">ID příjemce</span>
          <input
            className="field"
            placeholder="Například 284761953 nebo Denisa Šmídová001"
            value={recipientPublicId}
            onChange={(event) => setRecipientPublicId(event.target.value)}
            required
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Zrušit
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sdílení..." : "Sdílet složku"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
