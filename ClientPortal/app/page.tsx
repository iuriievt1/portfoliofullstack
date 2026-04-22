import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { requireSessionUser } from "@/lib/auth";
import { getFolderCategories, getFolderEntries, getFolders, getNotifications } from "@/lib/portal";
import type { PortalBootstrap } from "@/types";

export default async function HomePage() {
  const user = await requireSessionUser();
  if (!user) {
    redirect("/login");
  }

  const folders = await getFolders(user, {
    sortBy: "name",
    order: "asc"
  });

  const currentFolderId = folders.find((folder) => folder.parentId === null)?.id ?? folders[0]?.id ?? null;
  const entriesPayload = currentFolderId
    ? await getFolderEntries(user, currentFolderId, { sortBy: "createdAt", order: "desc" })
    : null;
  const [categories, notifications] = await Promise.all([
    getFolderCategories(user),
    getNotifications(user)
  ]);

  const bootstrap: PortalBootstrap = {
    user,
    folders,
    entries: entriesPayload?.entries ?? [],
    currentFolderId,
    categories,
    notifications
  };

  return <PortalShell initialData={bootstrap} />;
}
