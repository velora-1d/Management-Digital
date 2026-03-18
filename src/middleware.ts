import { NextRequest, NextResponse } from "next/server";
import { canAccess, isPublicApiPath } from "@/lib/rbac-permissions";

/**
 * Verify dan decode JWT payload menggunakan Web Crypto API (Edge Runtime compatible).
 * Mencegah pemalsuan token di middleware dengan memverifikasi signature.
 */
async function verifyAndDecodeJwt(token: string, secret: string): Promise<{ userId: number; name: string; email: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode header & verifikasi alg untuk mencegah "alg: none" attack
    const headerStr = atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"));
    const header = JSON.parse(headerStr);
    if (header.alg !== "HS256") return null;

    // Verifikasi Signature menggunakan Web Crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureStr = atob(parts[2].replace(/-/g, "+").replace(/_/g, "/"));
    const signatureBytes = new Uint8Array(signatureStr.length);
    for (let i = 0; i < signatureStr.length; i++) {
        signatureBytes[i] = signatureStr.charCodeAt(i);
    }
    const dataBytes = encoder.encode(parts[0] + "." + parts[1]);

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, dataBytes);
    if (!isValid) return null;

    // Decode payload dengan aman untuk karakter UTF-8
    const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payloadBytes = new Uint8Array(payloadStr.length);
    for (let i = 0; i < payloadStr.length; i++) {
        payloadBytes[i] = payloadStr.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8");
    const payloadUtf8 = decoder.decode(payloadBytes);
    const payload = JSON.parse(payloadUtf8);

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

    // Cek JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi server tidak valid" },
        { status: 500 }
      );
    }

    // Verify & Decode JWT
    const payload = await verifyAndDecodeJwt(token, secret);
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
