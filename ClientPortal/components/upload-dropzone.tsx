"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type UploadDropzoneProps = {
  folderId: string | null;
  onUploaded: () => Promise<void>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

type UploadState = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
};

export function UploadDropzone({
  folderId,
  onUploaded,
  onSuccess,
  onError,
  disabled = false
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadState[]>([]);

  function setUploadState(id: string, next: Partial<UploadState>) {
    setUploads((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...next } : entry))
    );
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!folderId) {
      onError("Nejdřív vyberte cílovou složku.");
      return;
    }

    if (disabled) {
      onError("Tato sdílená složka je jen pro čtení.");
      return;
    }

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      setUploads((current) => [
        ...current,
        { id, name: file.name, progress: 0, status: "uploading" }
      ]);

      await new Promise<void>((resolve) => {
        const formData = new FormData();
        formData.append("folderId", folderId);
        formData.append("files", file);

        const request = new XMLHttpRequest();
        request.open("POST", "/api/upload");

        request.upload.onprogress = (event) => {
          if (!event.lengthComputable) {
            return;
          }

          setUploadState(id, {
            progress: Math.round((event.loaded / event.total) * 100)
          });
        };

        request.onload = async () => {
          const payload = request.responseText ? JSON.parse(request.responseText) : {};

          if (request.status >= 200 && request.status < 300) {
            setUploadState(id, { progress: 100, status: "done" });
            onSuccess("Soubor byl nahrán");
            await onUploaded();
          } else {
            setUploadState(id, { status: "error" });
            onError(payload.error ?? "Nahrání souboru se nezdařilo.");
          }

          window.setTimeout(() => {
            setUploads((current) => current.filter((entry) => entry.id !== id));
          }, 1800);

          resolve();
        };

        request.onerror = () => {
          setUploadState(id, { status: "error" });
          onError("Nahrání souboru se nezdařilo.");
          resolve();
        };

        request.send(formData);
      });
    }
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) {
      return;
    }

    void uploadFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);

    if (!event.dataTransfer.files.length) {
      return;
    }

    void uploadFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          if (disabled) {
            return;
          }
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        disabled={disabled}
        className={`w-full rounded-[1.75rem] border-2 border-dashed px-5 py-6 text-left transition sm:px-6 sm:py-8 ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : dragging
            ? "border-teal-500 bg-teal-50"
            : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50"
        }`}
      >
        <p className="text-base font-semibold text-slate-900">
          {disabled ? "Sdílenou složku nelze upravovat" : "Nahrajte dokumenty do právě otevřené složky"}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {disabled
            ? "Tuto složku můžete otevřít a prohlížet, ale nahrávání je vyhrazené vlastníkovi."
            : "Přetáhněte soubory sem nebo klikněte pro výběr. Nahrávání funguje i pro více souborů najednou."}
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleSelect}
      />

      {uploads.length ? (
        <div className="space-y-3 rounded-[2rem] border border-slate-200 bg-white p-4">
          {uploads.map((upload) => (
            <div key={upload.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{upload.name}</span>
                <span className="text-slate-500">
                  {upload.status === "error" ? "Chyba" : `${upload.progress}%`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full transition-all ${
                    upload.status === "error" ? "bg-rose-500" : "bg-teal-600"
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
