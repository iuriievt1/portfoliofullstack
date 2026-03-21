import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions
} from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const data = parsed.data;
  const existingUser = await db.user.findUnique({
    where: { email: data.email.toLowerCase() }
  });

  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await db.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash
    }
  });

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  });

  const response = NextResponse.json({ ok: true, redirectTo: "/account" }, { status: 201 });
  response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
  return response;
}
