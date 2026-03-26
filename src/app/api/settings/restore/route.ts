import { NextResponse, NextRequest } from "next/server";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * Daftar tabel yang harus di-wipe sebelum restore.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // [SECURITY] Raw .sql execution is disabled due to critical SQL Injection risks.
    // Parsing and executing uploaded .sql strings directly via sql.raw() is insecure.
    // Database restorations must be handled securely via backend administrative tools (e.g. psql).
    return NextResponse.json(
      {
        success: false,
        error: "Restorasi .sql melalui API dinonaktifkan untuk alasan keamanan. Harap gunakan tool database seperti psql secara langsung ke server untuk restore data."
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
