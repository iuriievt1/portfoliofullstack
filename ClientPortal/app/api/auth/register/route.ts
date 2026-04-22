import { NextResponse } from "next/server";
import {
  createUniquePublicId,
  generateVerificationCode,
  getVerificationExpiryDate,
  hashPassword,
  hashVerificationCode,
  normalizeEmail
} from "@/lib/auth";
import { sendVerificationCodeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
  const consent = Boolean(body?.consent);

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "Vyplňte všechna povinná pole." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Heslo musí mít alespoň 8 znaků." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Hesla se neshodují." }, { status: 400 });
  }

  if (!consent) {
    return NextResponse.json({ error: "Je nutný souhlas se zpracováním údajů." }, { status: 400 });
  }

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" }
  });

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser?.emailVerifiedAt) {
    return NextResponse.json({ error: "Účet s tímto e-mailem už existuje." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        publicId: await createUniquePublicId(),
        name,
        email,
        passwordHash,
        roleId: userRole.id,
        consentAcceptedAt: new Date()
      }
    }));

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        passwordHash,
        consentAcceptedAt: new Date(),
        roleId: userRole.id
      }
    });
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
    name,
    email,
    code
  });

  return NextResponse.json({
    ok: true,
    email
  });
}
