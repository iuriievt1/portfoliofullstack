import { ItemType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/storage";
import { toNumber } from "@/lib/utils";
import type { ContentEntry, FolderRecord, NotificationRecord, SessionUser } from "@/types";

type FolderFilters = {
  search?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  author?: string | null;
  sortBy?: string | null;
  order?: string | null;
};

type EntryFilters = FolderFilters & {
  type?: string | null;
  sizeMin?: string | null;
  sizeMax?: string | null;
};

type SharedBy = {
  id: string;
  name: string;
  publicId: string;
} | null;

type AccessInfo = {
  canManage: boolean;
  sharedBy: SharedBy;
  shareId: string | null;
};

const authorSelect = {
  id: true,
  name: true,
  email: true
} satisfies Prisma.UserSelect;

function isAdmin(user: SessionUser) {
  return user.role === "admin";
}

function buildDateFilter(dateFrom?: string | null, dateTo?: string | null) {
  const createdAt: Prisma.DateTimeFilter = {};

  if (dateFrom) {
    createdAt.gte = new Date(dateFrom);
  }

  if (dateTo) {
    createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
  }

  return Object.keys(createdAt).length ? createdAt : undefined;
}

function mapOrderBy(sortBy?: string | null, order?: string | null): Prisma.FolderOrderByWithRelationInput {
  if (sortBy === "createdAt" || sortBy === "newest" || sortBy === "oldest") {
    return { createdAt: sortBy === "oldest" || order === "asc" ? "asc" : "desc" };
  }

  return { name: order === "desc" ? "desc" : "asc" };
}

async function getFolderAccessMap(user: SessionUser) {
  const folders = await prisma.folder.findMany({
    select: {
      id: true,
      parentId: true,
      authorId: true
    }
  });

  if (isAdmin(user)) {
    return new Map(
      folders.map((folder) => [
        folder.id,
        {
          canManage: true,
          sharedBy: null,
          shareId: null
        } satisfies AccessInfo
      ])
    );
  }

  const shares = await prisma.folderShare.findMany({
    where: {
      recipientId: user.id
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          publicId: true
        }
      }
    }
  });

  const accessMap = new Map<string, AccessInfo>();
  const childrenByParent = new Map<string | null, string[]>();

  for (const folder of folders) {
    const key = folder.parentId ?? null;
    const current = childrenByParent.get(key) ?? [];
    current.push(folder.id);
    childrenByParent.set(key, current);

    if (folder.authorId === user.id) {
      accessMap.set(folder.id, {
        canManage: true,
        sharedBy: null,
        shareId: null
      });
    }
  }

  for (const share of shares) {
    const queue = [share.folderId];

    while (queue.length) {
      const currentId = queue.shift()!;
      if (!accessMap.has(currentId)) {
        accessMap.set(currentId, {
          canManage: false,
          sharedBy: share.sender,
          shareId: share.id
        });
      }

      const children = childrenByParent.get(currentId) ?? [];
      queue.push(...children);
    }
  }

  return accessMap;
}

function sortEntries(entries: ContentEntry[], sortBy?: string | null, order?: string | null) {
  const direction = order === "asc" || sortBy === "oldest" ? 1 : -1;
  const effectiveSort = sortBy === "newest" || sortBy === "oldest" ? "createdAt" : sortBy ?? "name";

  return entries.sort((left, right) => {
    if (effectiveSort === "createdAt") {
      return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction;
    }

    if (effectiveSort === "type") {
      return left.kind.localeCompare(right.kind, "cs") * direction;
    }

    if (effectiveSort === "size") {
      return ((Number(left.sizeBytes ?? "0") || 0) - (Number(right.sizeBytes ?? "0") || 0)) * direction;
    }

    return left.name.localeCompare(right.name, "cs") * direction;
  });
}

export async function getFolders(user: SessionUser, filters: FolderFilters = {}) {
  const accessMap = await getFolderAccessMap(user);
  const accessibleIds = Array.from(accessMap.keys());

  if (!accessibleIds.length) {
    return [];
  }

  const dateFilter = buildDateFilter(filters.dateFrom, filters.dateTo);
  const folders = await prisma.folder.findMany({
    where: {
      id: {
        in: accessibleIds
      },
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive"
                }
              },
              {
                category: {
                  contains: filters.search,
                  mode: "insensitive"
                }
              }
            ]
          }
        : {}),
      ...(filters.author
        ? {
            author: {
              name: {
                contains: filters.author,
                mode: "insensitive"
              }
            }
          }
        : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {})
    },
    include: {
      author: {
        select: authorSelect
      },
      _count: {
        select: {
          children: true,
          items: true
        }
      }
    },
    orderBy: mapOrderBy(filters.sortBy, filters.order)
  });

  return folders.map<FolderRecord>((folder) => {
    const access = accessMap.get(folder.id)!;

    return {
      id: folder.id,
      name: folder.name,
      category: folder.category,
      parentId: folder.parentId,
      canManage: access.canManage,
      sharedBy: access.sharedBy,
      createdAt: folder.createdAt.toISOString(),
      author: folder.author,
      childrenCount: folder._count.children,
      itemsCount: folder._count.items
    };
  });
}

export async function getFolderById(user: SessionUser, folderId: string) {
  const accessMap = await getFolderAccessMap(user);
  const access = accessMap.get(folderId);

  if (!access) {
    return null;
  }

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId
    },
    include: {
      author: {
        select: authorSelect
      }
    }
  });

  if (!folder) {
    return null;
  }

  return {
    ...folder,
    canManage: access.canManage,
    sharedBy: access.sharedBy,
    shareId: access.shareId
  };
}

export async function getFolderEntries(user: SessionUser, folderId: string, filters: EntryFilters = {}) {
  const accessMap = await getFolderAccessMap(user);
  const access = accessMap.get(folderId);

  if (!access) {
    return null;
  }

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId
    },
    include: {
      author: {
        select: authorSelect
      }
    }
  });

  if (!folder) {
    return null;
  }

  const dateFilter = buildDateFilter(filters.dateFrom, filters.dateTo);
  const accessibleIds = Array.from(accessMap.keys());

  const folders = await prisma.folder.findMany({
    where: {
      id: {
        in: accessibleIds
      },
      parentId: folderId,
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive"
                }
              },
              {
                category: {
                  contains: filters.search,
                  mode: "insensitive"
                }
              }
            ]
          }
        : {}),
      ...(filters.author
        ? {
            author: {
              name: {
                contains: filters.author,
                mode: "insensitive"
              }
            }
          }
        : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {})
    },
    include: {
      author: {
        select: authorSelect
      }
    }
  });

  const sizeMin = toNumber(filters.sizeMin);
  const sizeMax = toNumber(filters.sizeMax);
  const fileSizeFilter =
    sizeMin !== undefined || sizeMax !== undefined
      ? {
          ...(sizeMin !== undefined ? { gte: BigInt(sizeMin) } : {}),
          ...(sizeMax !== undefined ? { lte: BigInt(sizeMax) } : {})
        }
      : undefined;
  const itemType =
    filters.type === "file"
      ? ItemType.FILE
      : filters.type === "link"
        ? ItemType.LINK
        : undefined;

  const items = await prisma.folderItem.findMany({
    where: {
      folderId,
      ...(itemType ? { type: itemType } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive"
                }
              },
              {
                link: {
                  is: {
                    description: {
                      contains: filters.search,
                      mode: "insensitive"
                    }
                  }
                }
              },
              {
                link: {
                  is: {
                    url: {
                      contains: filters.search,
                      mode: "insensitive"
                    }
                  }
                }
              }
            ]
          }
        : {}),
      ...(filters.author
        ? {
            author: {
              name: {
                contains: filters.author,
                mode: "insensitive"
              }
            }
          }
        : {}),
      ...(fileSizeFilter
        ? {
            file: {
              is: {
                size: fileSizeFilter
              }
            }
          }
        : {})
    },
    include: {
      author: {
        select: authorSelect
      },
      file: true,
      link: true
    }
  });

  const entries: ContentEntry[] = [
    ...folders.map((child) => ({
      id: child.id,
      kind: "folder" as const,
      name: child.name,
      category: child.category,
      createdAt: child.createdAt.toISOString(),
      author: child.author,
      sizeBytes: null,
      parentId: child.parentId
    })),
    ...items.map((item) => ({
      id: item.id,
      kind: item.type === ItemType.FILE ? ("file" as const) : ("link" as const),
      name: item.name,
      createdAt: item.createdAt.toISOString(),
      author: item.author,
      sizeBytes: item.file?.size.toString() ?? null,
      mimeType: item.file?.mimeType ?? null,
      storagePath: item.file?.storagePath ?? null,
      url: item.link?.url ?? null,
      description: item.link?.description ?? null,
      parentId: item.folderId
    }))
  ];

  return {
    folder: {
      id: folder.id,
      name: folder.name,
      category: folder.category,
      parentId: folder.parentId,
      author: folder.author,
      canManage: access.canManage,
      sharedBy: access.sharedBy
    },
    entries: sortEntries(entries, filters.sortBy, filters.order)
  };
}

export async function getFolderCategories(user: SessionUser) {
  const ownedFolders = await prisma.folder.findMany({
    where: {
      ...(isAdmin(user) ? {} : { authorId: user.id }),
      category: {
        not: null
      }
    },
    select: {
      category: true
    }
  });

  return Array.from(
    new Set(
      ownedFolders
        .map((folder) => folder.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  ).sort((left, right) => left.localeCompare(right, "cs"));
}

export async function getNotifications(user: SessionUser) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          publicId: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20
  });

  return notifications.map<NotificationRecord>((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    folderId: notification.folderId,
    sender: notification.sender
  }));
}

export async function markNotificationAsRead(user: SessionUser, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: user.id
    }
  });

  if (!notification) {
    return null;
  }

  return prisma.notification.update({
    where: {
      id: notificationId
    },
    data: {
      isRead: true,
      readAt: notification.readAt ?? new Date()
    }
  });
}

export async function markShareOpened(user: SessionUser, folderId: string) {
  const folder = await getFolderById(user, folderId);

  if (!folder?.shareId) {
    return;
  }

  await prisma.folderShare.update({
    where: {
      id: folder.shareId
    },
    data: {
      openedAt: new Date()
    }
  });
}

export async function deleteFolderTree(user: SessionUser, folderId: string) {
  const folder = await getFolderById(user, folderId);
  if (!folder || !folder.canManage) {
    return false;
  }

  const ownFolders = await prisma.folder.findMany({
    where: {
      ...(isAdmin(user) ? {} : { authorId: user.id })
    },
    select: {
      id: true,
      parentId: true
    }
  });

  const descendantIds = new Set<string>([folderId]);
  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of ownFolders) {
      if (candidate.parentId && descendantIds.has(candidate.parentId) && !descendantIds.has(candidate.id)) {
        descendantIds.add(candidate.id);
        changed = true;
      }
    }
  }

  const files = await prisma.file.findMany({
    where: {
      item: {
        folderId: {
          in: Array.from(descendantIds)
        }
      }
    },
    select: {
      storagePath: true
    }
  });

  await Promise.all(files.map((file) => deleteStoredFile(file.storagePath)));
  await prisma.folder.delete({
    where: {
      id: folderId
    }
  });

  return true;
}

export async function getItemDetails(user: SessionUser, itemId: string) {
  const item = await prisma.folderItem.findUnique({
    where: {
      id: itemId
    },
    include: {
      author: {
        select: authorSelect
      },
      file: true,
      link: true,
      folder: {
        include: {
          author: {
            select: authorSelect
          }
        }
      }
    }
  });

  if (!item) {
    return null;
  }

  const folder = await getFolderById(user, item.folderId);
  if (!folder) {
    return null;
  }

  return {
    id: item.id,
    type: item.type,
    name: item.name,
    createdAt: item.createdAt.toISOString(),
    author: item.author,
    folder: {
      id: item.folder.id,
      name: item.folder.name,
      parentId: item.folder.parentId
    },
    file: item.file
      ? {
          id: item.file.id,
          originalName: item.file.originalName,
          storedName: item.file.storedName,
          mimeType: item.file.mimeType,
          size: item.file.size.toString(),
          storagePath: item.file.storagePath,
          checksum: item.file.checksum
        }
      : null,
    link: item.link
      ? {
          id: item.link.id,
          url: item.link.url,
          description: item.link.description
        }
      : null,
    canManage: folder.canManage || user.role === "admin"
  };
}
