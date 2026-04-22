import { NextResponse } from "next/server";
import { requireApiSessionUser } from "@/lib/auth";
import { markNotificationAsRead } from "@/lib/portal";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ notificationId: string }> }
) {
  const user = await requireApiSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  }

  const { notificationId } = await context.params;
  const notification = await markNotificationAsRead(user, notificationId);

  if (!notification) {
    return NextResponse.json({ error: "Notifikace nebyla nalezena." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
