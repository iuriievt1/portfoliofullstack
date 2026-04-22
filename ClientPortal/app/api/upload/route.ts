import { NextResponse } from "next/server";
import { getFolderById } from "@/lib/portal";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";
import { deleteStoredFile, storeIncomingFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const formData = await request.formData();
  const folderId = String(formData.get("folderId") ?? "");
  const folder = await getFolderById(user, folderId);

  if (!folder) {
    return NextResponse.json({ error: "Cílová složka nebyla nalezena." }, { status: 404 });
  }

  if (!folder.canManage) {
    return NextResponse.json({ error: "Do této složky nelze nahrávat soubory." }, { status: 403 });
  }

  const allFiles = formData
    .getAll("files")
    .filter((entry): entry is File => typeof File !== "undefined" && entry instanceof File);

  if (!allFiles.length) {
    return NextResponse.json({ error: "Nebyl vybrán žádný soubor." }, { status: 400 });
  }

  const created = [];
  const failed = [];

  for (const file of allFiles) {
    let storedFile:
      | Awaited<ReturnType<typeof storeIncomingFile>>
      | null = null;

    try {
      storedFile = await storeIncomingFile(file);

      const item = await prisma.folderItem.create({
        data: {
          name: file.name,
          type: "FILE",
          folderId,
          authorId: user.id,
          file: {
            create: storedFile
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
          file: true
        }
      });

      created.push({
        id: item.id,
        kind: "file",
        name: item.name,
        category: null,
        createdAt: item.createdAt.toISOString(),
        author: item.author,
        sizeBytes: item.file?.size.toString() ?? null,
        mimeType: item.file?.mimeType ?? null,
        storagePath: item.file?.storagePath ?? null,
        parentId: folderId
      });
    } catch (error) {
      if (storedFile) {
        await deleteStoredFile(storedFile.storagePath);
      }

      failed.push({
        name: file.name,
        error: error instanceof Error ? error.message : "Nepodařilo se uložit soubor."
      });
    }
  }

  return NextResponse.json(
    {
      items: created,
      errors: failed
    },
    { status: failed.length ? 207 : 201 }
  );
}
