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

export type FolderSummary = {
  id: string;
  name: string;
  category: string | null;
  parentId: string | null;
  createdAt: string;
  canManage: boolean;
  sharedBy: {
    id: string;
    name: string;
    publicId: string;
  } | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
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

export type ItemDetail = {
  id: string;
  type: "FILE" | "LINK";
  name: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  folder: {
    id: string;
    name: string;
    parentId: string | null;
  };
  file: {
    id: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: string;
    storagePath: string;
    checksum: string | null;
  } | null;
  link: {
    id: string;
    url: string;
    description: string | null;
  } | null;
  canManage: boolean;
};

export type TokensPayload = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type StoredAuthState = TokensPayload & {
  accessTokenExpiresAt: number;
};

export type UploadQueueItem = {
  id: string;
  name: string;
  uri: string;
  mimeType: string | null;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};
