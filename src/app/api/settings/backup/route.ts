import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * Escape nilai untuk SQL string literal PostgreSQL.
 * Menangani single-quote, backslash, dan null.
 */
function escapeSQL(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  // String: escape single-quote dengan double single-quote
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * Buat INSERT statement dari array data dan kolom yang diketahui.
 */
function generateInserts(tableName: string, rows: any[]): string {
  if (!rows || rows.length === 0) return "";
  const lines: string[] = [];
  for (const row of rows) {
    const keys = Object.keys(row);
    const cols = keys.map((k) => `"${k}"`).join(", ");
    const vals = keys.map((k) => escapeSQL(row[k])).join(", ");
    lines.push(`INSERT INTO "${tableName}" (${cols}) VALUES (${vals});`);
  }
  return lines.join("\n");
}

/**
 * Daftar tabel dan query Prisma untuk di-backup.
 * Urut berdasarkan dependency (tabel induk dulu).
 * Kunci = nama tabel PostgreSQL sesuai @@map di schema.prisma.
 */
const TABLE_QUERIES = [
  { table: "academic_years",         query: () => prisma.academicYear.findMany({ where: { deletedAt: null } }) },
  { table: "school_settings",       query: () => prisma.schoolSetting.findMany({}) },
  { table: "classrooms",            query: () => prisma.classroom.findMany({ where: { deletedAt: null } }) },
  { table: "students",              query: () => prisma.student.findMany({ where: { deletedAt: null } }) },
  { table: "employees",             query: () => prisma.employee.findMany({ where: { deletedAt: null } }) },
  { table: "users",                 query: () => prisma.user.findMany({ select: { id: true, name: true, email: true, password: true, role: true, status: true, unitId: true, createdAt: true, updatedAt: true } }) },
  { table: "cash_accounts",         query: () => prisma.cashAccount.findMany({ where: { deletedAt: null } }) },
  { table: "transaction_categories", query: () => prisma.transactionCategory.findMany({ where: { deletedAt: null } }) },
  { table: "salary_components",     query: () => prisma.salaryComponent.findMany({ where: { deletedAt: null } }) },
  { table: "employee_salaries",     query: () => prisma.employeeSalary.findMany({ where: { deletedAt: null } }) },
  { table: "inventories",           query: () => prisma.inventory.findMany({ where: { deletedAt: null } }) },
  { table: "general_transactions",  query: () => prisma.generalTransaction.findMany({ where: { deletedAt: null } }) },
  { table: "student_savings",       query: () => prisma.studentSaving.findMany({ where: { deletedAt: null } }) },
  { table: "infaq_bills",           query: () => prisma.infaqBill.findMany({ where: { deletedAt: null } }) },
  { table: "infaq_payments",        query: () => prisma.infaqPayment.findMany({ where: { deletedAt: null } }) },
  { table: "ppdb_registrations",    query: () => prisma.ppdbRegistration.findMany({ where: { deletedAt: null } }) },
  { table: "re_registrations",      query: () => prisma.reRegistration.findMany({ where: { deletedAt: null } }) },
  { table: "registration_payments", query: () => prisma.registrationPayment.findMany({ where: { deletedAt: null } }) },
  { table: "payrolls",              query: () => prisma.payroll.findMany({ where: { deletedAt: null } }) },
  { table: "payroll_details",       query: () => prisma.payrollDetail.findMany({ where: { deletedAt: null } }) },
  { table: "wakaf_donors",          query: () => prisma.wakafDonor.findMany({ where: { deletedAt: null } }) },
  { table: "wakaf_purposes",        query: () => prisma.wakafPurpose.findMany({ where: { deletedAt: null } }) },
];

/**
 * GET /api/settings/backup — Download database backup sebagai file SQL
 * Hanya superadmin yang boleh
 */
export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    const now = new Date().toISOString();
    const parts: string[] = [];

    // Header
    parts.push("-- ============================================================");
    parts.push(`-- DATABASE BACKUP — ${now}`);
    parts.push(`-- Exported by user ID: ${user.userId}`);
    parts.push("-- Format: PostgreSQL INSERT statements");
    parts.push("-- ============================================================");
    parts.push("");
    parts.push("BEGIN;");
    parts.push("");

    // Generate INSERT statements per tabel
    for (const entry of TABLE_QUERIES) {
      const rows = await entry.query();
      if (rows.length === 0) continue;
      parts.push(`-- === ${entry.table} (${rows.length} rows) ===`);
      parts.push(generateInserts(entry.table, rows));
      parts.push("");
    }

    parts.push("COMMIT;");
    parts.push("");

    const sql = parts.join("\n");
    const dateStr = now.split("T")[0];

    return new Response(sql, {
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup_${dateStr}.sql"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal membuat backup" }, { status: 500 });
  }
}
