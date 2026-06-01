import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn(
      "WARNING: JWT_SECRET tidak ditemukan. Pastikan sudah di-set di environment variables.",
    );
    return "";
  }
  return secret;
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

export interface AuthCookieOptions {
  secure?: boolean;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (hash && !hash.startsWith("$2")) {
    const legacyHash = crypto
      .createHash("sha256")
      .update(password + (hash.includes("@") ? "" : ""))
      .digest("hex");
    return legacyHash === hash;
  }
  return bcrypt.compareSync(password, hash);
}

export function isLegacyHash(hash: string): boolean {
  return !!(hash && !hash.startsWith("$2"));
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(
  payload: JwtPayload,
  options: AuthCookieOptions = {},
): Promise<string> {
  const token = generateToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return token;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}
