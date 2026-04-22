import { useCallback, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import type { DocumentPickerAsset } from "expo-document-picker";
import type { UploadQueueItem } from "@/src/types/api";
import { apiUrl } from "@/src/lib/config";

function createQueueItem(asset: DocumentPickerAsset): UploadQueueItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: asset.name,
    uri: asset.uri,
    mimeType: asset.mimeType ?? null,
    progress: 0,
    status: "pending"
  };
}

export function useUploadQueue(folderId: string, getAccessToken: () => Promise<string | null>) {
  const [items, setItems] = useState<UploadQueueItem[]>([]);

  const appendFiles = useCallback((assets: DocumentPickerAsset[]) => {
    setItems((current) => [...current, ...assets.map(createQueueItem)]);
  }, []);

  const uploadOne = useCallback(
    async (item: UploadQueueItem) => {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error("Chybí přístupový token.");
      }

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: "uploading", progress: 0, error: undefined } : entry
        )
      );

      const task = FileSystem.createUploadTask(
        `${apiUrl}/api/upload`,
        item.uri,
        {
          fieldName: "files",
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          mimeType: item.mimeType ?? undefined,
          parameters: {
            folderId
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        },
        (progress: FileSystem.UploadProgressData) => {
          const ratio =
            progress.totalBytesExpectedToSend > 0
              ? progress.totalBytesSent / progress.totalBytesExpectedToSend
              : 0;

          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, progress: Math.round(ratio * 100) } : entry
            )
          );
        }
      );

      const response = await task.uploadAsync();
      const payload = response?.body ? JSON.parse(response.body) : null;

      if (!response || (response.status ?? 500) >= 400) {
        const error = payload?.error || payload?.errors?.[0]?.error || "Nahrávání selhalo.";
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, status: "error", error, progress: 0 } : entry
          )
        );
        throw new Error(error);
      }

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: "done", progress: 100, error: undefined } : entry
        )
      );
    },
    [folderId, getAccessToken]
  );

  const uploadAll = useCallback(async () => {
    let hasError = false;

    for (const item of items.filter((entry) => entry.status === "pending" || entry.status === "error")) {
      try {
        await uploadOne(item);
      } catch {
        hasError = true;
      }
    }

    if (hasError) {
      throw new Error("Některé soubory se nepodařilo nahrát.");
    }
  }, [items, uploadOne]);

  const retryUpload = useCallback(
    async (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) {
        return;
      }

      await uploadOne(item);
    },
    [items, uploadOne]
  );

  return {
    items,
    appendFiles,
    uploadAll,
    retryUpload,
    hasPending: items.some((entry) => entry.status === "pending" || entry.status === "error")
  };
}
