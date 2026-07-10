import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for access token in cookies or rely on client-side check
  // Note: We're checking for the presence of auth intent via a cookie
  // The actual token is in localStorage (client-side only)
  
  // For auth callback, always allow - it handles its own logic
  if (pathname.startsWith("/auth/callback")) {
    // Clear the URL params from history by redirecting without them after processing
    // This is handled client-side, so just allow the request
    return NextResponse.next();
  }
  
  // For protected routes, we can't check localStorage from middleware
  // So we rely on client-side checks, but we can set headers to prevent caching
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    // Prevent caching of protected pages
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
