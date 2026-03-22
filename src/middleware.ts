import { NextRequest, NextResponse } from "next/server";
import { canAccess, isPublicApiPath } from "@/lib/rbac-permissions";

/**
 * Verify JWT signature using Web Crypto API for Edge Runtime.
 */
async function verifyJwtSignature(token: string, secret: string): Promise<{ userId: number; name: string; email: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let base64 = parts[2].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const signatureBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      signatureBytes[i] = binary.charCodeAt(i);
    }

    const dataBytes = encoder.encode(parts[0] + "." + parts[1]);

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, dataBytes);

    if (!isValid) return null;

    let payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payloadBase64.length % 4) {
      payloadBase64 += "=";
    }
    const payload = JSON.parse(atob(payloadBase64));

    if (!payload.userId || !payload.role) return null;
    // Cek expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("erp_token")?.value;
  const { pathname } = request.nextUrl;

  // =============================================
  // 1. API Routes — cek token + RBAC permission
  // =============================================
  if (pathname.startsWith("/api/")) {
    // Path publik (login, logout) → lewat tanpa cek
    if (isPublicApiPath(pathname)) {
      return NextResponse.next();
    }

    // Cek token
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Anda harus login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Verify JWT signature (Edge Runtime compatible)
    const payload = await verifyJwtSignature(token, process.env.JWT_SECRET || "");
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Sesi telah berakhir, silakan login ulang" },
        { status: 401 }
      );
    }

    // Cek permission berdasarkan role
    if (!canAccess(payload.role, pathname)) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses untuk fitur ini" },
        { status: 403 }
      );
    }

    // Inject user info ke header (bisa dipakai API route)
    const response = NextResponse.next();
    response.headers.set("x-user-id", String(payload.userId));
    response.headers.set("x-user-role", payload.role);
    response.headers.set("x-user-name", payload.name);
    return response;
  }

  // =============================================
  // 2. Halaman — redirect ke login jika belum auth
  // =============================================
  const publicPages = ["/login"];
  const isPublicPage = publicPages.some((p) => pathname.startsWith(p));

  // Belum login → redirect ke /login
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sudah login tapi buka /login → redirect ke /dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
