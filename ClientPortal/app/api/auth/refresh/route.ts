import { NextResponse } from "next/server";
import { rotateAuthSession, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";

  if (!refreshToken) {
    return NextResponse.json({ error: "Chybí refresh token." }, { status: 400 });
  }

  const payload = await rotateAuthSession(refreshToken, request);

  if (!payload) {
    return NextResponse.json({ error: "Relace vypršela. Přihlaste se znovu." }, { status: 401 });
  }

  await setSession(payload.user);

  return NextResponse.json(payload);
}
