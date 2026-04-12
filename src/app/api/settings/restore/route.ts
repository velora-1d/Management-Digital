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

const ALLOWED_TABLES = new Set([...WIPE_ORDER, "users"]);

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

    const insertStatements: string[] = [];
    const tableCounts: Record<string, number> = {};

    const rawLines = sqlContent.split("\n").map((line) => line.trim());
    for (const line of rawLines) {
      if (!line.startsWith("INSERT INTO")) continue;

      // Ensure statement structure
      const match = line.match(/^INSERT INTO "([a-zA-Z0-9_]+)"/);
      if (!match) {
        return NextResponse.json(
          { success: false, error: "Format INSERT statement tidak valid atau berpotensi berbahaya." },
          { status: 400 }
        );
      }

      const table = match[1];
      if (!ALLOWED_TABLES.has(table)) {
        return NextResponse.json(
          { success: false, error: `Tabel tidak diizinkan untuk di-restore: ${table}` },
          { status: 400 }
        );
      }

      // Check for multi-statement injection
      const strippedLine = line.replace(/'(?:[^']|'')*'/g, "''");
      if ((strippedLine.match(/;/g) || []).length > 1 || !strippedLine.endsWith(";")) {
        return NextResponse.json(
          { success: false, error: "Terdeteksi potensi SQL Injection (multiple statements)." },
          { status: 400 }
        );
      }

      insertStatements.push(line);
      tableCounts[table] = (tableCounts[table] || 0) + 1;
    }

    if (insertStatements.length === 0) {
      return NextResponse.json(
        { success: false, error: "File SQL tidak mengandung INSERT statement yang valid." },
        { status: 400 }
      );
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
