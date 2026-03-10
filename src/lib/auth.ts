import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET: string = process.env.JWT_SECRET || "";

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  // Hanya throw error jika bukan dalam fase build Next.js (jika bisa dideteksi) 
  // atau saat runtime sebenarnya. Untuk kemudahan build, kita beri peringatan.
  console.warn("WARNING: JWT_SECRET tidak ditemukan. Pastikan sudah di-set di environment variables.");
}
const TOKEN_NAME = "erp_token";
const TOKEN_EXPIRY = "7d";

export interface JwtPayload {
  userId: number;
  name: string;
  email: string;
  role: string;
  unitId: string;
}

/**
 * Hash password menggunakan bcrypt
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verifikasi password dengan hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  // Support legacy hash format dari Apps Script (SHA256)
  if (hash && !hash.startsWith("$2")) {
    // Legacy: simple SHA256 comparison (dari GAS)
    const crypto = require("crypto");
    const legacyHash = crypto
      .createHash("sha256")
      .update(password + (hash.includes("@") ? "" : ""))
      .digest("hex");
    return legacyHash === hash;
  }
  return bcrypt.compareSync(password, hash);
}

/**
 * Cek apakah hash masih menggunakan format legasi (SHA256).
 * Jika iya, return true → caller harus re-hash ke bcrypt.
 */
export function isLegacyHash(hash: string): boolean {
  return !!(hash && !hash.startsWith("$2"));
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify JWT token dan return payload
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Ambil user dari cookie token (untuk server components / API routes)
 */
export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Set auth cookie
 */
export async function setAuthCookie(payload: JwtPayload): Promise<string> {
  const token = generateToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 hari
    path: "/",
  });
  return token;
}

/**
 * Hapus auth cookie (logout)
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}
