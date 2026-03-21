import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.sub) return null;

  const user = await db.user.findUnique({
    where: { id: session.sub },
    include: { sellerProfile: true }
  });

  if (!user || !user.isActive) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

export async function requireRole(roles: Array<"CUSTOMER" | "SELLER" | "ADMIN">) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
