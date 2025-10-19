import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { guestRegex, isDevelopmentEnvironment } from "./lib/constants";
import { FEATURE_GUEST_ACCOUNTS } from "./lib/feature-flags";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Playwright health check
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Skip middleware for auth APIs, static files, and assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if running behind HTTPS proxy
  const proto = request.headers.get('x-forwarded-proto');
  const isSecure = proto === 'https' || process.env.NODE_ENV === 'production';
  
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: isSecure && proto === 'https', // Only use secure cookies with HTTPS
  });

  const isAuthPage = ["/", "/login", "/register", "/login/form"].includes(pathname);
  const isProtectedPage = pathname.startsWith("/chat") || pathname.startsWith("/settings");

  // Unauthenticated users
  if (!token) {
    if (isAuthPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Authenticated users on auth pages - redirect to chat
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // Guest account restrictions
  const isGuest = guestRegex.test(token?.email ?? "");
  if (isGuest && !FEATURE_GUEST_ACCOUNTS && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
