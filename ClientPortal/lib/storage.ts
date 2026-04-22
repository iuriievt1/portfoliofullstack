import crypto from "node:crypto";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { UPLOADS_DIR } from "@/lib/constants";
import { sanitizeFileName } from "@/lib/utils";

export async function ensureUploadsDir() {
  const target = path.join(process.cwd(), UPLOADS_DIR);
  await mkdir(target, { recursive: true });
  return target;
}

export async function storeIncomingFile(file: File) {
  const uploadsDir = await ensureUploadsDir();
  const extension = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
  const storedName = `${Date.now()}-${crypto.randomUUID()}-${baseName}${extension ? `.${extension}` : ""}`;
  const storagePath = path.join(uploadsDir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(storagePath, buffer);

  return {
    storagePath: `/uploads/${storedName}`,
    storedName,
    extension: extension || null,
    size: BigInt(file.size),
    mimeType: file.type || "application/octet-stream",
    originalName: file.name,
    checksum: crypto.createHash("sha256").update(buffer).digest("hex")
  };
}

export async function deleteStoredFile(storagePath: string) {
  const filePath = path.join(process.cwd(), "public", storagePath.replace(/^\/+/, ""));

  try {
    await unlink(filePath);
  } catch {
    return;
  }
}
