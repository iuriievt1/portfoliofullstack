import { NextResponse } from "next/server";
import { clearSession, revokeAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : null;

  if (refreshToken) {
    await revokeAuthSession(refreshToken);
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
