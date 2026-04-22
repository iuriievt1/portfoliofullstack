import { NextResponse } from "next/server";
import { deleteFolderTree, getFolderById } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";

function normalizeCategory(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

export async function GET(
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

  return NextResponse.json({
    folder: {
      id: folder.id,
      name: folder.name,
      category: folder.category,
      parentId: folder.parentId,
      createdAt: folder.createdAt.toISOString(),
      canManage: folder.canManage,
      sharedBy: folder.sharedBy,
      author: folder.author
    }
  });
}

export async function PATCH(
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
    return NextResponse.json({ error: "Tuto složku nemůžete upravovat." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = normalizeCategory(body?.category);
  if (!name) {
    return NextResponse.json({ error: "Název složky je povinný." }, { status: 400 });
  }

  const duplicate = await prisma.folder.findFirst({
    where: {
      id: {
        not: folderId
      },
      parentId: folder.parentId,
      name,
      authorId: user.id
    }
  });

  if (duplicate) {
    return NextResponse.json({ error: "Složka se stejným názvem už existuje." }, { status: 409 });
  }

  const updated = await prisma.folder.update({
    where: { id: folderId },
    data: {
      name,
      category
    }
  });

  return NextResponse.json({
    folder: {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      parentId: updated.parentId,
      createdAt: updated.createdAt.toISOString()
    }
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ folderId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { folderId } = await context.params;
  const deleted = await deleteFolderTree(user, folderId);

  if (!deleted) {
    return NextResponse.json({ error: "Složku nelze smazat." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
