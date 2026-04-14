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

const ALLOWED_TABLES = new Set(WIPE_ORDER);

function isValidInsertStatement(stmt: string): boolean {
  const trimmed = stmt.trim();
  const match = trimmed.match(/^INSERT INTO "([^"]+)"/i);
  if (!match) return false;

  const table = match[1];
  if (!ALLOWED_TABLES.has(table)) return false;

  if (trimmed.includes("$$") || trimmed.match(/\$[a-zA-Z0-9_]*\$/)) {
    return false;
  }

  if (trimmed.match(/\bSELECT\b/i)) {
    return false;
  }

  let stripped = "";
  let inString = false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === "'") {
      if (inString && i + 1 < trimmed.length && trimmed[i+1] === "'") {
        i++; // skip escaped quote
      } else {
        inString = !inString;
      }
    } else if (!inString) {
      stripped += trimmed[i];
    }
  }

  if (stripped.indexOf(";") !== -1 && stripped.indexOf(";") !== stripped.length - 1) {
    return false;
  }

  if (stripped.includes("--") || stripped.includes("/*")) {
    return false;
  }

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

    if (insertStatements.length === 0) {
      return NextResponse.json(
        { success: false, error: "File SQL tidak mengandung INSERT statement yang valid." },
        { status: 400 }
      );
    }

    const invalidStmt = insertStatements.find(stmt => !isValidInsertStatement(stmt));
    if (invalidStmt) {
      return NextResponse.json(
        { success: false, error: "File SQL mengandung statement yang tidak diizinkan atau berpotensi berbahaya." },
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
        if (!ALLOWED_TABLES.has(table)) continue;
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
