import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
    academicYears, 
    schoolSettings, 
    classrooms, 
    studentEnrollments,
    students, 
    employees, 
    users, 
    cashAccounts, 
    transactionCategories, 
    salaryComponents, 
    employeeSalaries, 
    inventories, 
    generalTransactions, 
    studentSavings,
    infaqBills,
    infaqPayments,
    ppdbRegistrations,
    reRegistrations,
    registrationPayments,
    payrolls,
    payrollDetails,
    organizationPositions,
    products,
    coopTransactions,
    studentCredits,
    wakafDonors,
    wakafPurposes,
    webHeroes,
    webPosts,
    webFacilities,
    webAchievements,
    webTeachers,
    webSettings,
    webPrograms,
    webStats,
} from "@/db/schema";
import { isNull } from "drizzle-orm";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * Escape nilai untuk SQL string literal PostgreSQL.
 */
function escapeSQL(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

/**
 * Buat INSERT statement dari array data dan kolom yang diketahui.
 */
function generateInserts(tableName: string, rows: Record<string, unknown>[]): string {
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
 * Daftar tabel dan query Drizzle untuk di-backup.
 */
const TABLE_QUERIES = [
  { table: "academic_years", query: () => db.select().from(academicYears).where(isNull(academicYears.deletedAt)) },
  { table: "school_settings", query: () => db.select().from(schoolSettings) },
  { table: "classrooms", query: () => db.select().from(classrooms).where(isNull(classrooms.deletedAt)) },
  { table: "students", query: () => db.select().from(students).where(isNull(students.deletedAt)) },
  { table: "student_enrollments", query: () => db.select().from(studentEnrollments).where(isNull(studentEnrollments.deletedAt)) },
  { table: "employees", query: () => db.select().from(employees).where(isNull(employees.deletedAt)) },
  { table: "organization_positions", query: () => db.select().from(organizationPositions) },
  { table: "users", query: () => db.select({ id: users.id, name: users.name, email: users.email, password: users.password, role: users.role, status: users.status, unitId: users.unitId, createdAt: users.createdAt, updatedAt: users.updatedAt }).from(users) },
  { table: "cash_accounts", query: () => db.select().from(cashAccounts).where(isNull(cashAccounts.deletedAt)) },
  { table: "transaction_categories", query: () => db.select().from(transactionCategories).where(isNull(transactionCategories.deletedAt)) },
  { table: "salary_components", query: () => db.select().from(salaryComponents).where(isNull(salaryComponents.deletedAt)) },
  { table: "employee_salaries", query: () => db.select().from(employeeSalaries).where(isNull(employeeSalaries.deletedAt)) },
  { table: "inventories", query: () => db.select().from(inventories).where(isNull(inventories.deletedAt)) },
  { table: "general_transactions", query: () => db.select().from(generalTransactions).where(isNull(generalTransactions.deletedAt)) },
  { table: "student_savings", query: () => db.select().from(studentSavings).where(isNull(studentSavings.deletedAt)) },
  { table: "infaq_bills", query: () => db.select().from(infaqBills).where(isNull(infaqBills.deletedAt)) },
  { table: "infaq_payments", query: () => db.select().from(infaqPayments).where(isNull(infaqPayments.deletedAt)) },
  { table: "ppdb_registrations", query: () => db.select().from(ppdbRegistrations).where(isNull(ppdbRegistrations.deletedAt)) },
  { table: "re_registrations", query: () => db.select().from(reRegistrations).where(isNull(reRegistrations.deletedAt)) },
  { table: "registration_payments", query: () => db.select().from(registrationPayments).where(isNull(registrationPayments.deletedAt)) },
  { table: "payrolls", query: () => db.select().from(payrolls).where(isNull(payrolls.deletedAt)) },
  { table: "payroll_details", query: () => db.select().from(payrollDetails).where(isNull(payrollDetails.deletedAt)) },
  { table: "products", query: () => db.select().from(products).where(isNull(products.deletedAt)) },
  { table: "coop_transactions", query: () => db.select().from(coopTransactions).where(isNull(coopTransactions.deletedAt)) },
  { table: "student_credits", query: () => db.select().from(studentCredits).where(isNull(studentCredits.deletedAt)) },
  { table: "wakaf_donors", query: () => db.select().from(wakafDonors).where(isNull(wakafDonors.deletedAt)) },
  { table: "wakaf_purposes", query: () => db.select().from(wakafPurposes).where(isNull(wakafPurposes.deletedAt)) },
  { table: "cms_web_heroes", query: () => db.select().from(webHeroes) },
  { table: "cms_web_posts", query: () => db.select().from(webPosts) },
  { table: "cms_web_facilities", query: () => db.select().from(webFacilities) },
  { table: "cms_web_achievements", query: () => db.select().from(webAchievements) },
  { table: "cms_web_teachers", query: () => db.select().from(webTeachers) },
  { table: "cms_web_settings", query: () => db.select().from(webSettings) },
  { table: "cms_web_programs", query: () => db.select().from(webPrograms) },
  { table: "cms_web_stats", query: () => db.select().from(webStats) },
];

export async function GET() {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    const now = new Date().toISOString();
    const parts: string[] = [];
    const skippedTables: string[] = [];
    let exportedTables = 0;

    parts.push("-- ============================================================");
    parts.push(`-- DATABASE BACKUP — ${now}`);
    parts.push(`-- Exported by user ID: ${user.userId}`);
    parts.push("-- Format: PostgreSQL INSERT statements");
    parts.push("-- ============================================================");
    parts.push("");
    parts.push("BEGIN;");
    parts.push("");

    for (const entry of TABLE_QUERIES) {
      try {
        const rows = await entry.query();
        if (rows.length === 0) continue;

        exportedTables++;
        parts.push(`-- === ${entry.table} (${rows.length} rows) ===`);
        parts.push(generateInserts(entry.table, rows));
        parts.push("");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        skippedTables.push(`${entry.table}: ${message}`);
        console.error(`Backup table failed [${entry.table}]`, error);
        parts.push(`-- === ${entry.table} SKIPPED ===`);
        parts.push(`-- ${message}`);
        parts.push("");
      }
    }

    if (exportedTables === 0) {
      throw new Error(skippedTables[0] || "Tidak ada tabel yang berhasil diekspor.");
    }

    if (skippedTables.length > 0) {
      parts.push("-- === SKIPPED TABLES ===");
      for (const skipped of skippedTables) {
        parts.push(`-- ${skipped}`);
      }
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
        "X-Backup-Skipped-Tables": String(skippedTables.length),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Backup error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message: `Gagal membuat backup: ${message}` }, { status: 500 });
  }
}
