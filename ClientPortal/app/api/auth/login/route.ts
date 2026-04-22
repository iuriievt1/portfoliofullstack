import { NextResponse } from "next/server";
import { authenticate, createAuthSession, normalizeEmail, setSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const deviceName = typeof body?.deviceName === "string" ? body.deviceName.trim() : null;

  if (!email || !password) {
    return NextResponse.json({ error: "Vyplňte e-mail a heslo." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      emailVerifiedAt: true
    }
  });

  if (existingUser && !existingUser.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Účet ještě není ověřený. Zadejte ověřovací kód z e-mailu." },
      { status: 403 }
    );
  }

  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: "Neplatné přihlašovací údaje." }, { status: 401 });
  }

  await setSession(user);
  const tokens = await createAuthSession(user, request, deviceName);

  return NextResponse.json({ user, ...tokens });
}
