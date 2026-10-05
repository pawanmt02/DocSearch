import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("docsearch_token")?.value;

  let sessionPayload: { id: string; email: string; name: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      sessionPayload = payload as any;
    } catch (e) {
      sessionPayload = null;
    }
  }

  // 1. Protection for /admin routes (PDR Section 5: Security & Route Protection)
  if (pathname.startsWith("/admin")) {
    if (!sessionPayload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // If decrypted JWT lacks ROLE: ADMIN flag, rewrite/redirect to /dashboard
    if (sessionPayload.role !== "ADMIN") {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // 2. Protection for /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!sessionPayload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Redirect authenticated users away from /login
  if (pathname === "/login") {
    if (sessionPayload) {
      if (sessionPayload.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login"],
};
