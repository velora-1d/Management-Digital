/**
 * RBAC Helpers — Server-side Only
 * 
 * File ini boleh mengimport modules Node.js karena hanya dipakai
 * di API routes (server-side), bukan di middleware (Edge Runtime).
 */

import { getAuthUser, JwtPayload } from "@/lib/auth";

// Re-export semua dari permissions (agar backward-compatible)
export { type Role, ALL_ROLES, ROUTE_PERMISSIONS, PUBLIC_API_PATHS, SIDEBAR_PERMISSIONS, isPublicApiPath, canAccess } from "@/lib/rbac-permissions";

/**
 * Helper: ambil user dari cookie, throw error jika tidak terautentikasi
 */
export async function requireAuth(): Promise<JwtPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError("Anda harus login terlebih dahulu", 401);
  }
  return user;
}

/**
 * Helper: cek apakah user memiliki salah satu role yang diizinkan
 */
export function requireRole(user: JwtPayload, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Anda tidak memiliki akses untuk fitur ini", 403);
  }
}

/**
 * Custom error class untuk auth errors
 */
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
