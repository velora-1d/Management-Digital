import { NextRequest, NextResponse } from "next/server";
import { getTenantFromHost } from "@/lib/tenant";

function extractTenantIdFromCookie(request: NextRequest): string | null {
  try {
    const token = request.cookies.get("erp_token")?.value;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.tenantId) {
      return String(payload.tenantId);
    }
  } catch {
    // Abaikan error decoding token
  }
  return null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const tenantSlug = getTenantFromHost(host);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);

  const cookieTenantId = extractTenantIdFromCookie(request);
  requestHeaders.set("x-tenant-id", cookieTenantId || "1");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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

export default middleware;
