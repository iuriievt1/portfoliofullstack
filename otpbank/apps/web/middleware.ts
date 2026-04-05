import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/accounts", "/transactions", "/transfer", "/cards", "/settings", "/documents", "/notifications", "/admin", "/support"];

export function middleware(request: NextRequest) {
  const needsAuth = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  const hasToken = Boolean(request.cookies.get("otpbank_at")?.value);

  if (needsAuth && !hasToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
