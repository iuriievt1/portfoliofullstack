import { NextResponse } from "next/server";
import { getFolderById, getFolderEntries, markShareOpened } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ folderId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { folderId } = await context.params;
  const { searchParams } = new URL(request.url);

  const payload = await getFolderEntries(user, folderId, {
    search: searchParams.get("search"),
    type: searchParams.get("type"),
    sizeMin: searchParams.get("sizeMin"),
    sizeMax: searchParams.get("sizeMax"),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
    author: searchParams.get("author"),
    sortBy: searchParams.get("sortBy"),
    order: searchParams.get("order")
  });

  if (!payload) {
    return NextResponse.json({ error: "Složka nebyla nalezena." }, { status: 404 });
  }

  await markShareOpened(user, folderId);

  return NextResponse.json(payload);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ folderId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { folderId } = await context.params;
  const folder = await getFolderById(user, folderId);
  if (!folder) {
    return NextResponse.json({ error: "Složka nebyla nalezena." }, { status: 404 });
  }

  if (!folder.canManage) {
    return NextResponse.json({ error: "Do této složky nelze přidávat odkazy." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!name || !url) {
    return NextResponse.json({ error: "Název a URL jsou povinné." }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL adresa není platná." }, { status: 400 });
  }

  const linkItem = await prisma.folderItem.create({
    data: {
      name,
      type: "LINK",
      folderId,
      authorId: user.id,
      link: {
        create: {
          url,
          description: description || null
        }
      }
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      link: true
    }
  });

  return NextResponse.json(
    {
      item: {
        id: linkItem.id,
        kind: "link",
        name: linkItem.name,
        category: null,
        createdAt: linkItem.createdAt.toISOString(),
        author: linkItem.author,
        sizeBytes: null,
        storagePath: null,
        url: linkItem.link?.url ?? null,
        description: linkItem.link?.description ?? null,
        parentId: folderId
      }
    },
    { status: 201 }
  );
}
