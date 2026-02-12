import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Route Protection
  const protectedPaths = ["/admin"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isLoginPage = pathname === "/admin/login";

  if (isProtected && !isLoginPage && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && token) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 2. API Proxy (BFF Pattern)
  if (pathname.startsWith("/api")) {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || "http://backend:4000";
    // Strip /api prefix. If path was just /api, it becomes empty string, so default to /
    const targetPath = pathname.replace(/^\/api/, "") || "/";
    const targetUrl = new URL(targetPath, backendUrl);

    // Copy headers
    const requestHeaders = new Headers(request.headers);

    // Rewrite to backend
    // Note: rewrite keeps the browser URL but fetches from upstream
    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
