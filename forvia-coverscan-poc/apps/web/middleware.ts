import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-demo";

/**
 * Demo auth guard: every route except /login*, /api/auth/*, /_next/*, /pages/*,
 * /specimens* and static files redirects to /login when the session cookie is absent.
 */
export function middleware(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next|pages|specimens|favicon\\.ico|.*\\..*).*)"],
};
