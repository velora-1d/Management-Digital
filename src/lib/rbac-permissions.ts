/**
 * RBAC Permissions — Edge Runtime Compatible
 * 
 * File ini TIDAK boleh mengimport module Node.js (jsonwebtoken, bcryptjs, dll)
 * karena dipakai oleh middleware.ts yang berjalan di Edge Runtime.
 */

export type Role = "superadmin" | "admin" | "bendahara" | "operator" | "siswa" | "guru" | "koperasi";

export const ALL_ROLES: Role[] = ["superadmin", "admin", "bendahara", "operator", "siswa", "guru", "koperasi"];

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
  "/api/infaq-payments": ["superadmin", "admin", "bendahara"],
  "/api/tabungan": ["superadmin", "admin", "bendahara"],
  "/api/wakaf": ["superadmin", "admin", "bendahara"],
  "/api/journal": ["superadmin", "admin", "bendahara"],
  "/api/transaction-categories": ["superadmin", "admin", "bendahara"],
  "/api/reports": ["superadmin", "admin", "bendahara"],

  // === DATA MASTER ===
  // (Guru perlu akses read-only ke data ini untuk dropdown nilai & absen)
  "/api/students": ["superadmin", "admin", "operator", "guru"],
  "/api/classrooms": ["superadmin", "admin", "operator", "guru"],
  "/api/academic-years": ["superadmin", "admin", "operator", "guru"],
  "/api/teachers": ["superadmin", "admin", "operator", "guru"],
  "/api/staff": ["superadmin", "admin", "operator"],
  "/api/inventory": ["superadmin", "admin", "operator"],

  // === AKADEMIK (superadmin + admin + operator + guru) ===
  "/api/subjects": ["superadmin", "admin", "operator", "guru"],
  "/api/teaching-assignments": ["superadmin", "admin", "operator", "guru"],
  "/api/schedules": ["superadmin", "admin", "operator", "siswa", "guru"],
  "/api/attendance": ["superadmin", "admin", "operator", "guru"],
  "/api/grades": ["superadmin", "admin", "guru"],
  "/api/curriculum": ["superadmin", "admin"],
  "/api/report-cards": ["superadmin", "admin", "operator"],
  "/api/extracurricular": ["superadmin", "admin", "operator"],
  "/api/counseling": ["superadmin", "admin", "guru"],
  "/api/calendar": ALL_ROLES,

  // === PENERIMAAN SISWA (superadmin + admin + operator) ===
  "/api/ppdb": ["superadmin", "admin", "operator"],
  "/api/reregistration": ["superadmin", "admin", "operator"],
  
  // === KOPERASI (superadmin + admin + bendahara + koperasi) ===
  "/api/coop": ["superadmin", "admin", "bendahara", "koperasi"],

  // === TATA USAHA (superadmin + admin + operator) ===
  "/api/employee-attendance": ["superadmin", "admin", "operator"],
  "/api/letters": ["superadmin", "admin", "operator"],
  "/api/announcements": ["superadmin", "admin", "operator"],
  "/api/school-profile": ["superadmin", "admin"],

  // === AUTH & MISC ===
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
  
  // Penerimaan
  "/ppdb": ["superadmin", "admin", "operator"],
  "/re-registration": ["superadmin", "admin", "operator"],
  
  // Data Master
  "/students": ["superadmin", "admin", "operator"],
  "/mutations": ["superadmin", "admin"],
  "/classrooms": ["superadmin", "admin", "operator"],
  "/academic-years": ["superadmin", "admin"],
  "/transaction-categories": ["superadmin", "admin", "bendahara"],
  
  // Akademik
  "/subjects": ["superadmin", "admin", "operator"],
  "/teaching-assignments": ["superadmin", "admin", "operator"],
  "/schedules": ["superadmin", "admin", "operator", "siswa", "guru"],
  "/attendance": ["superadmin", "admin", "operator", "guru"],
  "/curriculum": ["superadmin", "admin"],
  "/grades": ["superadmin", "admin", "guru"],
  "/report-cards": ["superadmin", "admin", "operator"],
  "/extracurricular": ["superadmin", "admin", "operator"],
  "/counseling": ["superadmin", "admin", "guru"],
  "/calendar": ALL_ROLES,

  // Keuangan
  "/infaq-bills": ["superadmin", "admin", "bendahara"],
  "/tabungan": ["superadmin", "admin", "bendahara"],
  "/wakaf": ["superadmin", "admin", "bendahara"],
  "/journal": ["superadmin", "admin", "bendahara"],
  "/reports": ["superadmin", "admin", "bendahara"],
  
  // SDM
  "/teachers": ["superadmin", "admin", "operator"],
  "/staff": ["superadmin", "admin", "operator"],
  "/payroll": ["superadmin", "admin", "bendahara"],
  "/inventory": ["superadmin", "admin", "operator"],
  
  // Koperasi
  "/coop/products": ["superadmin", "admin", "bendahara", "koperasi"],
  "/coop/transactions": ["superadmin", "admin", "bendahara", "koperasi"],
  "/coop/credits": ["superadmin", "admin", "bendahara", "koperasi"],
  
  // Tata Usaha
  "/employee-attendance": ["superadmin", "admin", "operator"],
  "/letters": ["superadmin", "admin", "operator"],
  "/announcements": ["superadmin", "admin", "operator"],
  "/school-profile": ["superadmin", "admin"],
  
  // Sistem
  "/settings": ["superadmin", "admin"],
};
