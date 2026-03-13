import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { verifyPassword, setAuthCookie, isLegacyHash, hashPassword } from "@/lib/auth";

// =============================================================
// Rate Limiting — in-memory, cukup untuk single-instance deploy
// =============================================================
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  // Bersihkan record lama
  if (record && now > record.resetAt) {
    loginAttempts.delete(ip);
  }

  const current = loginAttempts.get(ip);
  if (current && current.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record) {
    record.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// Bersihkan map setiap 30 menit untuk cegah memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    if (now > record.resetAt) loginAttempts.delete(ip);
  }
}, 30 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting berdasarkan IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: `Terlalu banyak percobaan login. Coba lagi dalam ${rateCheck.retryAfter} detik.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        isNull(users.deletedAt),
        eq(users.status, "aktif")
      ))
      .limit(1);

    if (!user) {
      recordAttempt(ip);
      return NextResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      recordAttempt(ip);
      return NextResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // Login berhasil — hapus record rate limit
    clearAttempts(ip);

    // Auto-rehash password legasi (SHA256) ke bcrypt
    if (isLegacyHash(user.password)) {
      try {
        await db.update(users)
          .set({ password: hashPassword(password) })
          .where(eq(users.id, user.id));
        console.log(`[SECURITY] Password user ${user.id} berhasil di-rehash dari SHA256 ke bcrypt.`);
      } catch (e) {
        // Jangan gagalkan login hanya karena rehash gagal
        console.error("[SECURITY] Gagal rehash password legasi:", e);
      }
    }

    // Set cookie JWT
    await setAuthCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      unitId: user.unitId || "",
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
