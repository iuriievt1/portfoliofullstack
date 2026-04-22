import { NextResponse } from "next/server";
import { getFolders, getFolderById } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";

function normalizeCategory(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

export async function GET(request: Request) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folders = await getFolders(user, {
    search: searchParams.get("search"),
    dateFrom: searchParams.get("dateFrom"),
    dateTo: searchParams.get("dateTo"),
    author: searchParams.get("author"),
    sortBy: searchParams.get("sortBy"),
    order: searchParams.get("order")
  });

  return NextResponse.json({ folders });
}

export async function POST(request: Request) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = normalizeCategory(body?.category);
  const parentId =
    typeof body?.parentId === "string" && body.parentId.length > 0 ? body.parentId : null;

  if (!name) {
    return NextResponse.json({ error: "Název složky je povinný." }, { status: 400 });
  }

  if (parentId) {
    const parentFolder = await getFolderById(user, parentId);
    if (!parentFolder) {
      return NextResponse.json({ error: "Nadřazená složka nebyla nalezena." }, { status: 404 });
    }

    if (!parentFolder.canManage) {
      return NextResponse.json(
        { error: "Do této sdílené složky nelze vytvářet nové podsložky." },
        { status: 403 }
      );
    }
  }

  const duplicate = await prisma.folder.findFirst({
    where: {
      name,
      parentId,
      authorId: user.id
    }
  });

  if (duplicate) {
    return NextResponse.json({ error: "Složka se stejným názvem už existuje." }, { status: 409 });
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      category,
      parentId,
      authorId: user.id
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          children: true,
          items: true
        }
      }
    }
  });

  return NextResponse.json(
    {
      folder: {
        id: folder.id,
        name: folder.name,
        category: folder.category,
        parentId: folder.parentId,
        canManage: true,
        sharedBy: null,
        createdAt: folder.createdAt.toISOString(),
        author: folder.author,
        childrenCount: folder._count.children,
        itemsCount: folder._count.items
      }
    },
    { status: 201 }
  );
}
