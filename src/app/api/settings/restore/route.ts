import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";

/**
 * Daftar tabel yang harus di-wipe sebelum restore.
 * Urutan sesuai foreign key (child tables dulu).
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

/**
 * POST /api/settings/restore — Restore data dari file backup SQL
 * Hanya superadmin yang boleh
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["superadmin"]);

    // Baca body sebagai text (file SQL)
    const sqlContent = await req.text();

    // Validasi format: harus mengandung header backup kita
    if (!sqlContent.includes("-- DATABASE BACKUP") && !sqlContent.includes("INSERT INTO")) {
      return NextResponse.json(
        { success: false, error: "Format file tidak valid. Pastikan file berasal dari fitur Backup (.sql)." },
        { status: 400 }
      );
    }

    // Parse metadata dari header SQL
    let exportedAt = "Tidak diketahui";
    const dateMatch = sqlContent.match(/-- DATABASE BACKUP — (.+)/);
    if (dateMatch) {
      exportedAt = dateMatch[1].trim();
    }

    // Ekstrak semua INSERT statements
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

    // Hitung jumlah per tabel untuk laporan
    const tableCounts: Record<string, number> = {};
    for (const stmt of insertStatements) {
      const match = stmt.match(/INSERT INTO "([^"]+)"/);
      if (match) {
        const table = match[1];
        tableCounts[table] = (tableCounts[table] || 0) + 1;
      }
    }

    // Eksekusi restore dalam transaksi
    await prisma.$transaction(
      async (tx) => {
        // 1. Wipe existing data (urutan sesuai foreign key)
        for (const table of WIPE_ORDER) {
          try {
            await tx.$executeRawUnsafe(`DELETE FROM "${table}"`);
          } catch {
            // Tabel mungkin tidak ada, skip saja
          }
        }

        // 2. Eksekusi INSERT statements satu per satu
        for (const stmt of insertStatements) {
          await tx.$executeRawUnsafe(stmt);
        }

        // 3. Reset sequence autoincrement agar sinkron
        for (const table of Object.keys(tableCounts)) {
          try {
            await tx.$executeRawUnsafe(
              `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`
            );
          } catch {
            // Tabel tanpa serial ID, skip
          }
        }
      },
      { timeout: 120000 } // Timeout 2 menit untuk data besar
    );

    // Buat laporan
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
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Restore error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Gagal restore data: ${msg}` },
      { status: 500 }
    );
  }
}
