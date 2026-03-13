import { NextRequest, NextResponse } from "next/server";
import { canAccess, isPublicApiPath } from "@/lib/rbac-permissions";

/**
 * Decode dan verifikasi JWT signature menggunakan Web Crypto API (Edge Runtime compatible).
 */
async function verifyJwtSignature(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${parts[0]}.${parts[1]}`);
    const signature = parts[2];

    const b64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    const paddedB64 = pad ? b64 + "=".repeat(4 - pad) : b64;
    const sigString = atob(paddedB64);

    const sigBytes = new Uint8Array(sigString.length);
    for (let i = 0; i < sigString.length; i++) {
      sigBytes[i] = sigString.charCodeAt(i);
    }

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    return await crypto.subtle.verify("HMAC", key, sigBytes, data);
  } catch {
    return false;
  }
}

async function verifyAndDecodeJwt(token: string): Promise<{ userId: number; name: string; email: string; role: string } | null> {
  try {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) return null;

    const isValid = await verifyJwtSignature(token, secret);
    if (!isValid) return null;

    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
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

    // Decode JWT (verifikasi signature — Edge Runtime compatible)
    const payload = await verifyAndDecodeJwt(token);
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
