import { NextResponse, NextRequest } from "next/server";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * Daftar tabel yang harus di-wipe sebelum restore.
 */
const WIPE_ORDER = [
  "payroll_details",
  "payrolls",
  "registration_payments",
  "re_registrations",
  "ppdb_registrations",
  "infaq_payments",
  "infaq_bills",
  "student_savings",
  "general_transactions",
  "employee_salaries",
  "inventories",
  "salary_components",
  "student_enrollments",
  "students",
  "employees",
  "transaction_categories",
  "classrooms",
  "wakaf_donors",
  "wakaf_purposes",
  "academic_years",
  "cash_accounts",
  "school_settings",
];

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // [SECURITY FIX] Menonaktifkan fitur restore via SQL dari aplikasi
    // Menggunakan sql.raw() dengan file teks tidak tervalidasi sangat berisiko SQL Injection.
    return NextResponse.json(
      {
        success: false,
        error: "Fitur restore via SQL dinonaktifkan untuk alasan keamanan. Harap gunakan tool database admin (misal: pgAdmin/Neon Console) untuk melakukan restore."
      },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Gagal restore data: ${msg}` }, { status: 500 });
  }
}
