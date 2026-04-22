"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentTable } from "@/components/content-table";
import { FolderModal } from "@/components/folder-modal";
import { FolderSidebar } from "@/components/folder-sidebar";
import { LinkModal } from "@/components/link-modal";
import { NotificationsPanel } from "@/components/notifications-panel";
import { ShareFolderModal } from "@/components/share-folder-modal";
import { UploadDropzone } from "@/components/upload-dropzone";
import { useToast } from "@/components/toast-provider";
import type {
  ContentEntry,
  FolderRecord,
  NotificationRecord,
  PortalBootstrap
} from "@/types";

type PortalShellProps = {
  initialData: PortalBootstrap;
};

type SortPreset = "alphabetical" | "newest" | "oldest" | "type" | "size";

const folderSortMap: Record<string, { sortBy: string; order: "asc" | "desc" }> = {
  alphabetical: { sortBy: "name", order: "asc" },
  newest: { sortBy: "newest", order: "desc" },
  oldest: { sortBy: "oldest", order: "asc" }
};

const contentSortMap: Record<SortPreset, { sortBy: string; order: "asc" | "desc" }> = {
  alphabetical: { sortBy: "name", order: "asc" },
  newest: { sortBy: "newest", order: "desc" },
  oldest: { sortBy: "oldest", order: "asc" },
  type: { sortBy: "type", order: "asc" },
  size: { sortBy: "size", order: "desc" }
};

function mergeCategories(current: string[], folders: FolderRecord[]) {
  return Array.from(
    new Set([
      ...current,
      ...folders
        .filter((folder) => folder.canManage)
        .map((folder) => folder.category?.trim())
        .filter((category): category is string => Boolean(category))
    ])
  ).sort((left, right) => left.localeCompare(right, "cs"));
}

export function PortalShell({ initialData }: PortalShellProps) {
  const router = useRouter();
  const toast = useToast();
  const [folders, setFolders] = useState<FolderRecord[]>(initialData.folders);
  const [entries, setEntries] = useState<ContentEntry[]>(initialData.entries);
  const [categories, setCategories] = useState<string[]>(initialData.categories);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(initialData.notifications);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialData.currentFolderId);
  const [currentFolderIdForEdit, setCurrentFolderIdForEdit] = useState<string | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [shareFolderOpen, setShareFolderOpen] = useState(false);

  const [folderSearch, setFolderSearch] = useState("");
  const [folderSort, setFolderSort] = useState("alphabetical");
  const [itemSearch, setItemSearch] = useState("");
  const [itemSort, setItemSort] = useState<SortPreset>("newest");
  const [itemType, setItemType] = useState("all");

  const deferredFolderSearch = useDeferredValue(folderSearch);
  const deferredItemSearch = useDeferredValue(itemSearch);

  const folderMap = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders]
  );

  const currentFolder = folders.find((folder) => folder.id === selectedFolderId) ?? null;
  const currentFolderPath = useMemo(() => {
    if (!currentFolder) {
      return [];
    }

    const path: FolderRecord[] = [];
    let cursor: FolderRecord | undefined | null = currentFolder;

    while (cursor) {
      path.unshift(cursor);
      cursor = cursor.parentId ? folderMap.get(cursor.parentId) : null;
    }

    return path;
  }, [currentFolder, folderMap]);

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Nepodařilo se načíst notifikace.");
      }

      setNotifications(payload.notifications as NotificationRecord[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nepodařilo se načíst notifikace.");
    }
  }

  async function fetchFolders(nextSelectedFolderId?: string | null) {
    setLoadingFolders(true);

    try {
      const sortConfig = folderSortMap[folderSort] ?? folderSortMap.alphabetical;
      const params = new URLSearchParams({
        sortBy: sortConfig.sortBy,
        order: sortConfig.order
      });

      if (deferredFolderSearch) {
        params.set("search", deferredFolderSearch);
      }

      const response = await fetch(`/api/folders?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Nepodařilo se načíst složky.");
      }

      const nextFolders = payload.folders as FolderRecord[];
      setFolders(nextFolders);
      setCategories((current) => mergeCategories(current, nextFolders));

      const chosenFolderId =
        nextSelectedFolderId !== undefined
          ? nextSelectedFolderId
          : nextFolders.some((folder) => folder.id === selectedFolderId)
            ? selectedFolderId
            : nextFolders.find((folder) => folder.parentId === null)?.id ?? nextFolders[0]?.id ?? null;

      setSelectedFolderId(chosenFolderId);

      if (chosenFolderId) {
        await fetchEntries(chosenFolderId);
      } else {
        setEntries([]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nepodařilo se načíst složky.");
    } finally {
      setLoadingFolders(false);
    }
  }

  async function fetchEntries(folderId = selectedFolderId) {
    if (!folderId) {
      setEntries([]);
      return;
    }

    setLoadingEntries(true);

    try {
      const sortConfig = contentSortMap[itemSort];
      const params = new URLSearchParams({
        sortBy: sortConfig.sortBy,
        order: sortConfig.order
      });

      if (deferredItemSearch) {
        params.set("search", deferredItemSearch);
      }
      if (itemType !== "all" && itemType !== "folder") {
        params.set("type", itemType);
      }

      const response = await fetch(`/api/folders/${folderId}/items?${params.toString()}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Nepodařilo se načíst obsah složky.");
      }

      const nextEntries = payload.entries as ContentEntry[];
      setEntries(itemType === "folder" ? nextEntries.filter((entry) => entry.kind === "folder") : nextEntries);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nepodařilo se načíst obsah složky.");
    } finally {
      setLoadingEntries(false);
    }
  }

  async function handleCreateFolder(payload: {
    name: string;
    parentId: string | null;
    category: string | null;
  }) {
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Složku se nepodařilo vytvořit.");
    }

    setCreateFolderOpen(false);
    if (data.folder?.category) {
      setCategories((current) =>
        Array.from(new Set([...current, data.folder.category])).sort((left, right) =>
          left.localeCompare(right, "cs")
        )
      );
    }
    toast.success("Složka byla vytvořena");
    await fetchFolders(data.folder.id);
  }

  async function handleEditFolder(payload: {
    name: string;
    parentId: string | null;
    category: string | null;
  }) {
    if (!currentFolderIdForEdit) {
      return;
    }

    const response = await fetch(`/api/folders/${currentFolderIdForEdit}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: payload.name,
        category: payload.category
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Složku se nepodařilo upravit.");
    }

    setEditFolderOpen(false);
    setCurrentFolderIdForEdit(null);
    if (data.folder?.category) {
      setCategories((current) =>
        Array.from(new Set([...current, data.folder.category])).sort((left, right) =>
          left.localeCompare(right, "cs")
        )
      );
    }
    await fetchFolders(selectedFolderId);
  }

  async function handleAddLink(payload: { name: string; url: string; description: string }) {
    if (!selectedFolderId) {
      toast.error("Nejdřív vyberte složku, do které chcete odkaz uložit.");
      return;
    }

    const response = await fetch(`/api/folders/${selectedFolderId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Odkaz se nepodařilo uložit.");
    }

    setLinkModalOpen(false);
    toast.success("Odkaz byl přidán");
    await fetchFolders(selectedFolderId);
  }

  async function handleShareFolder(recipientPublicId: string) {
    if (!selectedFolderId) {
      return;
    }

    const response = await fetch(`/api/folders/${selectedFolderId}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ recipientPublicId })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Sdílení složky se nezdařilo.");
    }

    setShareFolderOpen(false);
    toast.success("Složka byla nasdílena.");
  }

  async function handleDelete(entry: ContentEntry) {
    const confirmed = window.confirm(
      entry.kind === "folder"
        ? "Opravdu chcete smazat tuto složku včetně obsahu?"
        : "Opravdu chcete smazat tuto položku?"
    );

    if (!confirmed) {
      return;
    }

    const endpoint =
      entry.kind === "folder" ? `/api/folders/${entry.id}` : `/api/items/${entry.id}`;

    const response = await fetch(endpoint, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      toast.error(payload.error ?? "Mazání se nezdařilo.");
      return;
    }

    toast.success(entry.kind === "folder" ? "Složka byla smazána" : "Položka byla smazána");
    await fetchFolders(selectedFolderId);
  }

  async function handleOpenNotification(notification: NotificationRecord) {
    await fetch(`/api/notifications/${notification.id}`, {
      method: "PATCH"
    });

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    );

    if (notification.folderId) {
      setSelectedFolderId(notification.folderId);
      await fetchFolders(notification.folderId);
    }
  }

  async function handleCopyPublicId() {
    try {
      await navigator.clipboard.writeText(initialData.user.publicId);
      toast.success("Vaše ID bylo zkopírováno.");
    } catch {
      toast.error("ID se nepodařilo zkopírovat.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  useEffect(() => {
    void fetchFolders();
  }, [deferredFolderSearch, folderSort]);

  useEffect(() => {
    void fetchEntries();
  }, [selectedFolderId, deferredItemSearch, itemSort, itemType]);

  useEffect(() => {
    void fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="panel overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Klientský portál pro dokumenty a sdílení složek
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">
                  Spravujte vlastní složky, sdílejte je přes veřejné ID uživatele a sledujte nové
                  příchozí složky přímo v notifikacích.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleCopyPublicId} className="btn-secondary">
                  Moje ID: {initialData.user.publicId}
                </button>
                <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Přihlášený uživatel: {initialData.user.name}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setCreateFolderOpen(true)} className="btn-primary">
                Nová složka
              </button>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Odhlásit se
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 2xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <FolderSidebar
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelect={setSelectedFolderId}
            search={folderSearch}
            onSearchChange={setFolderSearch}
            sort={folderSort}
            onSortChange={setFolderSort}
            loading={loadingFolders}
          />

          <section className="space-y-4">
            <div className="panel overflow-hidden px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                      {currentFolderPath.length
                        ? currentFolderPath.map((folder) => (
                            <span key={folder.id} className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedFolderId(folder.id)}
                                className="hover:text-slate-600"
                              >
                                {folder.name}
                              </button>
                              {folder.id !== currentFolderPath[currentFolderPath.length - 1]?.id ? (
                                <span>/</span>
                              ) : null}
                            </span>
                          ))
                        : "Vyberte složku"}
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                        {currentFolder?.name ?? "Zatím není vybraná žádná složka"}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {currentFolder?.category ? (
                          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Kategorie: {currentFolder.category}
                          </span>
                        ) : null}
                        {currentFolder?.sharedBy ? (
                          <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            Sdílel: {currentFolder.sharedBy.name} ({currentFolder.sharedBy.publicId})
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {currentFolder ? (
                    <div className="flex flex-wrap gap-3">
                      {currentFolder.canManage ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setCreateFolderOpen(true)}
                            className="btn-secondary"
                          >
                            Nová podsložka
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentFolderIdForEdit(currentFolder.id);
                              setEditFolderOpen(true);
                            }}
                            className="btn-secondary"
                          >
                            Upravit složku
                          </button>
                          <button
                            type="button"
                            onClick={() => setShareFolderOpen(true)}
                            className="btn-secondary"
                          >
                            Sdílet složku
                          </button>
                        </>
                      ) : (
                        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                          Tato složka je sdílená pouze ke čtení.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <UploadDropzone
                  folderId={selectedFolderId}
                  disabled={!currentFolder?.canManage}
                  onUploaded={async () => {
                    await fetchFolders(selectedFolderId);
                  }}
                  onSuccess={toast.success}
                  onError={toast.error}
                />
              </div>
            </div>

            <div className="panel overflow-hidden px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <input
                    className="field lg:flex-1"
                    placeholder="Hledat dokument, odkaz nebo podsložku"
                    value={itemSearch}
                    onChange={(event) => setItemSearch(event.target.value)}
                  />

                  <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
                    <select
                      className="field"
                      value={itemSort}
                      onChange={(event) => setItemSort(event.target.value as SortPreset)}
                    >
                      <option value="newest">Nejnovější</option>
                      <option value="oldest">Nejstarší</option>
                      <option value="alphabetical">Abecedně</option>
                      <option value="type">Typ</option>
                      <option value="size">Velikost</option>
                    </select>

                    <select className="field" value={itemType} onChange={(event) => setItemType(event.target.value)}>
                      <option value="all">Vše</option>
                      <option value="folder">Jen složky</option>
                      <option value="file">Jen soubory</option>
                      <option value="link">Jen odkazy</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setLinkModalOpen(true)}
                      className="btn-secondary"
                      disabled={!selectedFolderId || !currentFolder?.canManage}
                    >
                      Nový odkaz
                    </button>
                  </div>
                </div>

                {loadingEntries || loadingFolders ? (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Načítání dat...
                  </div>
                ) : null}

                <ContentTable
                  entries={entries}
                  readOnly={!currentFolder?.canManage}
                  onOpenFolder={setSelectedFolderId}
                  onDeleteEntry={handleDelete}
                  onRenameFolder={(entry) => {
                    setCurrentFolderIdForEdit(entry.id);
                    setEditFolderOpen(true);
                  }}
                />
              </div>
            </div>
          </section>

          <NotificationsPanel
            notifications={notifications}
            onOpenNotification={handleOpenNotification}
          />
        </div>
      </div>

      <FolderModal
        open={createFolderOpen}
        mode="create"
        folders={folders.filter((folder) => folder.canManage)}
        selectedFolderId={currentFolder?.canManage ? selectedFolderId : null}
        categorySuggestions={categories}
        onClose={() => setCreateFolderOpen(false)}
        onSaved={handleCreateFolder}
      />

      <FolderModal
        open={editFolderOpen}
        mode="rename"
        folders={folders.filter((folder) => folder.canManage)}
        selectedFolderId={selectedFolderId}
        currentFolderName={folders.find((folder) => folder.id === currentFolderIdForEdit)?.name}
        currentCategoryName={folders.find((folder) => folder.id === currentFolderIdForEdit)?.category ?? undefined}
        categorySuggestions={categories}
        onClose={() => {
          setEditFolderOpen(false);
          setCurrentFolderIdForEdit(null);
        }}
        onSaved={handleEditFolder}
      />

      <ShareFolderModal
        open={shareFolderOpen}
        folderName={currentFolder?.name ?? ""}
        onClose={() => setShareFolderOpen(false)}
        onShared={handleShareFolder}
      />

      <LinkModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSaved={handleAddLink}
      />
    </main>
  );
}
