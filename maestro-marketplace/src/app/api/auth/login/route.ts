import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signInSchema } from "@/lib/validations/auth";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions
} from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email and password." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { sellerProfile: true }
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  });

  const redirectTo =
    user.role === "ADMIN"
      ? "/admin"
      : user.role === "SELLER"
        ? "/seller"
        : "/account";

  const response = NextResponse.json({ ok: true, redirectTo });
  response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
  return response;
}
