import { NextResponse } from "next/server";
import { requireApiSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await requireApiSessionUser(request);

  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  return NextResponse.json({ user });
}
