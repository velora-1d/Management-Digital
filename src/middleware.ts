import { NextRequest, NextResponse } from "next/server";
import { canAccess, isPublicApiPath } from "@/lib/rbac-permissions";

/**
 * Decode and verify JWT payload using Web Crypto API (Edge Runtime compatible).
 * Prevents attackers from bypassing RBAC using forged, unsigned tokens.
 */
async function verifyAndDecodeJwt(token: string, secret: string): Promise<{ userId: number; name: string; email: string; role: string } | null> {
  if (!secret) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payloadStr, signature] = parts;
    const data = new TextEncoder().encode(`${header}.${payloadStr}`);

    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + "=".repeat(padLen);
    const signatureBytes = Uint8Array.from(atob(paddedBase64), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);
    if (!isValid) return null;

    const payload = JSON.parse(atob(payloadStr.replace(/-/g, "+").replace(/_/g, "/")));
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

    // Decode JWT with signature verification
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "development-fallback-secret-do-not-use-in-production" : "");
    const payload = await verifyAndDecodeJwt(token, secret);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Sesi telah berakhir atau token tidak valid, silakan login ulang" },
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

  // Jika kita berada di halaman non-publik dan ada token, kita seharusnya juga memverifikasi
  // token untuk halaman web. Tapi jika terlalu berat, cukup biarkan karena SSR/API route
  // akan gagal bila token tidak valid. Namun lebih baik verifikasi juga.

  // Untuk halaman non-publik yang ada token, verify token
  if (token && !isPublicPage) {
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "development-fallback-secret-do-not-use-in-production" : "");
    const payload = await verifyAndDecodeJwt(token, secret);
    if (!payload) {
      // Token tidak valid/forged, redirect ke login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("erp_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
