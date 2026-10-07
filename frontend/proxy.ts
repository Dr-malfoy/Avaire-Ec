import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, isTokenFresh } from "@/lib/adminAuth";

// Redirects visitors without a valid admin session away from /admin pages.
// API calls (/api/admin/*) are protected by the backend itself (JWT + admin role).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const loggedIn = isTokenFresh(token);

  if (pathname === "/admin/login") {
    if (loggedIn) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.next();
  }

  if (!loggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin" && pathname !== "/admin/dashboard") loginUrl.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(loginUrl);
    if (token) res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
