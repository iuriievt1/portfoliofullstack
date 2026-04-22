import path from "node:path";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth";
import { getFolderById } from "@/lib/portal";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { itemId } = await context.params;
  const item = await prisma.folderItem.findUnique({
    where: {
      id: itemId
    },
    include: {
      file: true
    }
  });

  if (!item?.file) {
    return NextResponse.json({ error: "Soubor nebyl nalezen." }, { status: 404 });
  }

  const folder = await getFolderById(user, item.folderId);
  if (!folder) {
    return NextResponse.json({ error: "Přístup byl odepřen." }, { status: 403 });
  }

  const absolutePath = path.join(process.cwd(), "public", item.file.storagePath.replace(/^\/+/, ""));
  const info = await stat(absolutePath).catch(() => null);

  if (!info) {
    return NextResponse.json({ error: "Soubor na serveru chybí." }, { status: 404 });
  }

  const stream = createReadStream(absolutePath);

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": item.file.mimeType,
      "Content-Length": String(info.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(item.file.originalName)}`,
      "Cache-Control": "private, max-age=0, must-revalidate"
    }
  });
}
