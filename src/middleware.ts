import { NextRequest, NextResponse } from "next/server";
import { canAccess, isPublicApiPath } from "@/lib/rbac-permissions";

/**
 * Verifikasi JWT signature dan decode payload (Edge Runtime compatible).
 */
async function verifyJwtPayload(token: string): Promise<{ userId: number; name: string; email: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const secret = process.env.JWT_SECRET || "";
    if (!secret) {
      console.warn("WARNING: JWT_SECRET tidak ditemukan di environment variables.");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`${parts[0]}.${parts[1]}`);

    let base64 = parts[2].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const signature = atob(base64);
    const signatureBytes = new Uint8Array(signature.length);
    for (let i = 0; i < signature.length; i++) {
      signatureBytes[i] = signature.charCodeAt(i);
    }

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      data
    );

    if (!isValid) return null;

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

    // Decode dan verifikasi JWT (Edge Runtime compatible)
    const payload = await verifyJwtPayload(token);
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
