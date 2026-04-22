import { NextResponse } from "next/server";
import {
  generateVerificationCode,
  getVerificationExpiryDate,
  hashVerificationCode,
  normalizeEmail
} from "@/lib/auth";
import { sendVerificationCodeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";

  if (!email) {
    return NextResponse.json({ error: "Vyplňte e-mail." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return NextResponse.json({ error: "Účet nebyl nalezen." }, { status: 404 });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ error: "Účet je už ověřený." }, { status: 409 });
  }

  await prisma.emailVerificationCode.deleteMany({
    where: {
      userId: user.id
    }
  });

  const code = generateVerificationCode();
  await prisma.emailVerificationCode.create({
    data: {
      userId: user.id,
      email,
      codeHash: hashVerificationCode(code),
      expiresAt: getVerificationExpiryDate()
    }
  });

  await sendVerificationCodeEmail({
    name: user.name,
    email,
    code
  });

  return NextResponse.json({ ok: true });
}
