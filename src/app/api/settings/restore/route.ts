import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
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

const ALLOWED_TABLES = [
  "academic_years", "school_settings", "classrooms", "students", "employees",
  "users", "cash_accounts", "transaction_categories", "salary_components",
  "employee_salaries", "inventories", "general_transactions", "student_savings",
  "infaq_bills", "infaq_payments", "ppdb_registrations", "re_registrations",
  "registration_payments", "payrolls", "payroll_details", "wakaf_donors", "wakaf_purposes",
  "student_enrollments"
];

function isSafeInsertStatement(stmt: string): boolean {
  if (!stmt.startsWith("INSERT INTO ")) return false;
  if (!stmt.endsWith(";")) return false;

  // Safe replacement of valid SQL string literals (to prevent false positives with semicolons/parentheses)
  const stripped = stmt.replace(/'(?:[^']|'')*'/g, "''");

  // If there's any semicolon left besides the last character, it's an injection attempt
  if (stripped.indexOf(';') !== stripped.length - 1) return false;

  // Strict regex to match our backup tool's output format exactly
  const validRegex = /^INSERT INTO "([a-zA-Z0-9_]+)" \("[a-zA-Z0-9_]+"(?:, "[a-zA-Z0-9_]+")*\) VALUES \((?:''|NULL|TRUE|FALSE|null|true|false|-?[0-9.eE+-]+)(?:, (?:''|NULL|TRUE|FALSE|null|true|false|-?[0-9.eE+-]+))*\);$/;

  const match = stripped.match(validRegex);
  if (!match) return false;

  // Explicitly check that the table being inserted to is in our allowed list
  const table = match[1];
  if (!ALLOWED_TABLES.includes(table)) return false;

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    const sqlContent = await req.text();

    if (!sqlContent.includes("-- DATABASE BACKUP") && !sqlContent.includes("INSERT INTO")) {
      return NextResponse.json(
        { success: false, error: "Format file tidak valid. Pastikan file berasal dari fitur Backup (.sql)." },
        { status: 400 }
      );
    }

    let exportedAt = "Tidak diketahui";
    const dateMatch = sqlContent.match(/-- DATABASE BACKUP — (.+)/);
    if (dateMatch) {
      exportedAt = dateMatch[1].trim();
    }

    const insertStatements = sqlContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("INSERT INTO"));

    // Validate that all INSERT statements are safe before executing any of them
    const unsafeStatements = insertStatements.filter(stmt => !isSafeInsertStatement(stmt));
    if (unsafeStatements.length > 0) {
      console.warn("Detected unsafe INSERT statements during restore:", unsafeStatements);
      return NextResponse.json(
        { success: false, error: "File SQL mengandung statement yang tidak aman atau format tidak sesuai." },
        { status: 400 }
      );
    }

    if (insertStatements.length === 0) {
      return NextResponse.json(
        { success: false, error: "File SQL tidak mengandung INSERT statement yang valid." },
        { status: 400 }
      );
    }

    const tableCounts: Record<string, number> = {};
    for (const stmt of insertStatements) {
      const match = stmt.match(/INSERT INTO "([^"]+)"/);
      if (match) {
        const table = match[1];
        tableCounts[table] = (tableCounts[table] || 0) + 1;
      }
    }

    await db.transaction(async (tx) => {
      for (const table of WIPE_ORDER) {
        try {
          await tx.execute(sql.raw(`DELETE FROM "${table}"`));
        } catch (e) {
          // Skip if table doesn't exist
        }
      }

      for (const stmt of insertStatements) {
        await tx.execute(sql.raw(stmt));
      }

      for (const table of Object.keys(tableCounts)) {
        try {
          await tx.execute(
            sql.raw(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`)
          );
        } catch (e) {
          // Skip
        }
      }
    });

    const restored = Object.entries(tableCounts).map(
      ([table, count]) => `${table}: ${count} baris`
    );

    return NextResponse.json({
      success: true,
      message: "Data berhasil di-restore dari backup SQL.",
      restored,
      backupMeta: {
        exportedAt,
        totalStatements: insertStatements.length,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: `Gagal restore data: ${msg}` }, { status: 500 });
  }
}
