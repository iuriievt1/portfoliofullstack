export const apiUrl =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3000";

export const queryKeys = {
  session: ["session"] as const,
  folders: (params: string) => ["folders", params] as const,
  folder: (id: string) => ["folder", id] as const,
  folderEntries: (id: string, params: string) => ["folder-entries", id, params] as const,
  item: (id: string) => ["item", id] as const
};
