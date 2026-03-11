/**
 * RBAC Permissions — Edge Runtime Compatible
 * 
 * File ini TIDAK boleh mengimport module Node.js (jsonwebtoken, bcryptjs, dll)
 * karena dipakai oleh middleware.ts yang berjalan di Edge Runtime.
 */

export type Role = "superadmin" | "kepsek" | "admin" | "bendahara" | "operator" | "siswa" | "guru";

export const ALL_ROLES: Role[] = ["superadmin", "kepsek", "admin", "bendahara", "operator", "siswa", "guru"];

/**
 * Permission Map — role mana yang boleh mengakses path API tertentu.
 * Format: pathPrefix → array of roles yang DIIZINKAN
 * Jika path tidak ditemukan, default-nya SEMUA role boleh akses.
 */
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // === SETTINGS (superadmin only) ===
  "/api/settings/wipe": ["superadmin"],
  "/api/settings/profile": ALL_ROLES,

  // === USER MANAGEMENT (superadmin + admin) ===
  "/api/users": ["superadmin", "admin"],
  "/api/seed": ["superadmin"],

  // === KEUANGAN (superadmin + admin + bendahara) ===
  "/api/payroll": ["superadmin", "admin", "bendahara"],
  "/api/infaq-bills": ["superadmin", "admin", "bendahara"],
  "/api/tabungan": ["superadmin", "admin", "bendahara"],
  "/api/wakaf": ["superadmin", "admin", "bendahara"],
  "/api/journal": ["superadmin", "admin", "bendahara"],
  "/api/transaction-categories": ["superadmin", "admin", "bendahara"],

  // === DATA MASTER (superadmin + admin + operator) ===
  "/api/students": ["superadmin", "admin", "operator"],
  "/api/classrooms": ["superadmin", "admin", "operator"],
  "/api/academic-years": ["superadmin", "admin"],
  "/api/teachers": ["superadmin", "admin"],
  "/api/staff": ["superadmin", "admin"],
  "/api/inventory": ["superadmin", "admin", "operator"],

  // === AKADEMIK (superadmin + admin + operator) ===
  "/api/subjects": ["superadmin", "admin", "operator"],
  "/api/teaching-assignments": ["superadmin", "admin", "operator"],
  "/api/schedules": ["superadmin", "admin", "operator"],
  "/api/attendance": ["superadmin", "admin", "operator"],

  // === PENERIMAAN SISWA (superadmin + admin + operator) ===
  "/api/ppdb": ["superadmin", "admin", "operator"],
  "/api/reregistration": ["superadmin", "admin", "operator"],

  // === REPORTS & DASHBOARD (semua role) ===
  "/api/reports": ALL_ROLES,
  "/api/auth": ALL_ROLES,
  "/api/profile": ALL_ROLES,
};

/**
 * Path API yang TIDAK memerlukan autentikasi
 */
export const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
];

/**
 * Cek apakah sebuah path API memerlukan autentikasi
 */
export function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some(p => pathname.startsWith(p));
}

/**
 * Cek apakah role tertentu boleh mengakses path API
 */
export function canAccess(role: string, pathname: string): boolean {
  if (role === "superadmin") return true;

  let matchedRoles: Role[] | null = null;
  let matchLength = 0;

  for (const [pathPrefix, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(pathPrefix) && pathPrefix.length > matchLength) {
      matchedRoles = roles;
      matchLength = pathPrefix.length;
    }
  }

  if (matchedRoles === null) return true;
  return matchedRoles.includes(role as Role);
}

/**
 * Permission map untuk sidebar menu
 */
export const SIDEBAR_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": ALL_ROLES,
  "/ppdb": ["superadmin", "admin", "operator"],
  "/re-registration": ["superadmin", "admin", "operator"],
  "/students": ["superadmin", "admin", "operator"],
  "/mutations": ["superadmin", "admin"],
  "/classrooms": ["superadmin", "admin", "operator"],
  "/academic-years": ["superadmin", "admin"],
  "/transaction-categories": ["superadmin", "admin", "bendahara"],
  "/subjects": ["superadmin", "admin", "operator"],
  "/teaching-assignments": ["superadmin", "admin", "operator"],
  "/schedules": ["superadmin", "admin", "operator", "siswa"],
  "/attendance": ["superadmin", "admin", "operator"],
  "/infaq-bills": ["superadmin", "admin", "bendahara"],
  "/tabungan": ["superadmin", "admin", "bendahara"],
  "/wakaf": ["superadmin", "admin", "bendahara"],
  "/journal": ["superadmin", "admin", "bendahara"],
  "/reports": ALL_ROLES,
  "/teachers": ["superadmin", "admin"],
  "/staff": ["superadmin", "admin"],
  "/payroll": ["superadmin", "admin", "bendahara"],
  "/inventory": ["superadmin", "admin", "operator"],
  "/settings": ["superadmin", "admin"],
};
