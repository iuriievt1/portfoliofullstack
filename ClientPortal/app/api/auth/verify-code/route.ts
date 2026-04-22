import { NextResponse } from "next/server";
import {
  buildSessionUser,
  hashVerificationCode,
  normalizeEmail,
  setSession
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return NextResponse.json({ error: "Vyplňte e-mail a ověřovací kód." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Účet nebyl nalezen." }, { status: 404 });
  }

  const verificationCode = await prisma.emailVerificationCode.findFirst({
    where: {
      userId: user.id,
      email,
      consumedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!verificationCode || verificationCode.codeHash !== hashVerificationCode(code)) {
    return NextResponse.json({ error: "Ověřovací kód není platný." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.emailVerificationCode.update({
      where: {
        id: verificationCode.id
      },
      data: {
        consumedAt: new Date()
      }
    }),
    prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        emailVerifiedAt: user.emailVerifiedAt ?? new Date()
      }
    })
  ]);

  const sessionUser = buildSessionUser(user);
  await setSession(sessionUser);

  return NextResponse.json({
    user: sessionUser
  });
}
