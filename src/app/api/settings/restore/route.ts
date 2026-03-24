import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";
import * as schema from "@/db/schema";

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

    let backupContent;
    try {
      backupContent = await req.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Format file tidak valid. Pastikan file adalah JSON backup yang valid." },
        { status: 400 }
      );
    }

    if (!backupContent.meta || !backupContent.data) {
      return NextResponse.json(
        { success: false, error: "Struktur JSON tidak valid. Pastikan file berasal dari fitur Backup (.json)." },
        { status: 400 }
      );
    }

    const { meta, data } = backupContent;
    const exportedAt = meta.exportedAt || "Tidak diketahui";
    const tableCounts: Record<string, number> = {};

    // Helper to map DB table names to schema objects
    const tableToSchemaMap: Record<string, any> = {
      "academic_years": schema.academicYears,
      "school_settings": schema.schoolSettings,
      "classrooms": schema.classrooms,
      "students": schema.students,
      "employees": schema.employees,
      "users": schema.users,
      "cash_accounts": schema.cashAccounts,
      "transaction_categories": schema.transactionCategories,
      "salary_components": schema.salaryComponents,
      "employee_salaries": schema.employeeSalaries,
      "inventories": schema.inventories,
      "general_transactions": schema.generalTransactions,
      "student_savings": schema.studentSavings,
      "infaq_bills": schema.infaqBills,
      "infaq_payments": schema.infaqPayments,
      "ppdb_registrations": schema.ppdbRegistrations,
      "re_registrations": schema.reRegistrations,
      "registration_payments": schema.registrationPayments,
      "payrolls": schema.payrolls,
      "payroll_details": schema.payrollDetails,
      "wakaf_donors": schema.wakafDonors,
      "wakaf_purposes": schema.wakafPurposes,
    };

    let totalStatements = 0;

    await db.transaction(async (tx) => {
      // 1. Wipe current data securely
      for (const table of WIPE_ORDER) {
        try {
          // Allowed safe tables defined in WIPE_ORDER
          await tx.execute(sql.raw(`DELETE FROM "${table}"`));
        } catch (e) {
          // Skip if table doesn't exist
        }
      }

      // 2. Insert new data securely
      for (const [table, rows] of Object.entries(data)) {
        if (!Array.isArray(rows) || rows.length === 0) continue;
        const schemaObj = tableToSchemaMap[table];
        if (!schemaObj) continue; // Skip unknown tables

        // Ensure dates are converted properly from JSON strings
        const parsedRows = rows.map((row) => {
          const newRow: any = { ...row };
          for (const key of Object.keys(newRow)) {
            if (typeof newRow[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(newRow[key])) {
              newRow[key] = new Date(newRow[key]);
            }
          }
          return newRow;
        });

        // Split into batches to avoid PostgreSQL parameter limits (max 65535)
        const BATCH_SIZE = 1000;
        for (let i = 0; i < parsedRows.length; i += BATCH_SIZE) {
          const batch = parsedRows.slice(i, i + BATCH_SIZE);
          await tx.insert(schemaObj).values(batch);
        }

        tableCounts[table] = parsedRows.length;
        totalStatements += parsedRows.length;
      }

      // 3. Reset sequences
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
      message: "Data berhasil di-restore dari backup JSON.",
      restored,
      backupMeta: {
        exportedAt,
        totalStatements,
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
