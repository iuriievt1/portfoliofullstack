import { NextResponse } from "next/server";
import { getItemDetails } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";
import { deleteStoredFile } from "@/lib/storage";

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { itemId } = await context.params;
  const item = await getItemDetails(user, itemId);

  if (!item) {
    return NextResponse.json({ error: "Položka nebyla nalezena." }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { itemId } = await context.params;
  const item = await prisma.folderItem.findFirst({
    where: {
      id: itemId,
      ...(user.role === "admin" ? {} : { authorId: user.id })
    },
    include: {
      file: true
    }
  });

  if (!item) {
    return NextResponse.json({ error: "Položka nebyla nalezena." }, { status: 404 });
  }

  if (item.file?.storagePath) {
    await deleteStoredFile(item.file.storagePath);
  }

  await prisma.folderItem.delete({
    where: {
      id: itemId
    }
  });

  return NextResponse.json({ ok: true });
}
