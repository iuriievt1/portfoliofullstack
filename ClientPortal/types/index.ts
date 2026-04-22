export type RoleName = "admin" | "user";

export type SessionUser = {
  id: string;
  publicId: string;
  name: string;
  email: string;
  role: RoleName;
};

export type FolderRecord = {
  id: string;
  name: string;
  category: string | null;
  parentId: string | null;
  canManage: boolean;
  sharedBy: {
    id: string;
    name: string;
    publicId: string;
  } | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  childrenCount: number;
  itemsCount: number;
};

export type ContentEntry = {
  id: string;
  kind: "folder" | "file" | "link";
  name: string;
  category?: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  sizeBytes: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  url?: string | null;
  description?: string | null;
  parentId?: string | null;
};

export type NotificationRecord = {
  id: string;
  type: "FOLDER_SHARED";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  folderId: string | null;
  sender: {
    id: string;
    name: string;
    publicId: string;
  } | null;
};

export type PortalBootstrap = {
  user: SessionUser;
  folders: FolderRecord[];
  entries: ContentEntry[];
  currentFolderId: string | null;
  categories: string[];
  notifications: NotificationRecord[];
};
