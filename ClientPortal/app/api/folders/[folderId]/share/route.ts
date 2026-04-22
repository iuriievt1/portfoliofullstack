import { NextResponse } from "next/server";
import { getFolderById } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";

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
    return NextResponse.json({ error: "Tuto složku nemůžete sdílet." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const recipientPublicId =
    typeof body?.recipientPublicId === "string" ? body.recipientPublicId.trim() : "";

  if (!recipientPublicId) {
    return NextResponse.json({ error: "Zadejte ID příjemce." }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({
    where: {
      publicId: recipientPublicId
    }
  });

  if (!recipient) {
    return NextResponse.json({ error: "Uživatel s tímto ID nebyl nalezen." }, { status: 404 });
  }

  if (!recipient.emailVerifiedAt) {
    return NextResponse.json({ error: "Cílový uživatel ještě nemá ověřený účet." }, { status: 409 });
  }

  if (recipient.id === user.id) {
    return NextResponse.json({ error: "Složku nemůžete sdílet sami sobě." }, { status: 400 });
  }

  const share = await prisma.folderShare.upsert({
    where: {
      folderId_recipientId: {
        folderId,
        recipientId: recipient.id
      }
    },
    update: {
      senderId: user.id
    },
    create: {
      folderId,
      senderId: user.id,
      recipientId: recipient.id
    }
  });

  await prisma.notification.create({
    data: {
      userId: recipient.id,
      senderId: user.id,
      type: "FOLDER_SHARED",
      title: "Nově sdílená složka",
      message: `${user.name} (${user.publicId}) s vámi sdílel(a) složku „${folder.name}“`,
      folderId,
      shareId: share.id
    }
  });

  return NextResponse.json({
    ok: true
  });
}
