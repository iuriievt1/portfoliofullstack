import { NextResponse } from "next/server";
import { requireApiSessionUser } from "@/lib/auth";
import { getNotifications } from "@/lib/portal";

export async function GET(request: Request) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const notifications = await getNotifications(user);
  return NextResponse.json({ notifications });
}
