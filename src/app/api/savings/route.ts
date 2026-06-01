import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentSavings, students } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/savings — Ambil daftar Saldo Tabungan Siswa
 */
export async function GET() {
  try {
    await requireAuth();

    // Fix: Menggunakan kolom amount, balanceAfter, dan date sesuai schema asli
    const data = await db
      .select({
        id: studentSavings.id,
        amount: studentSavings.amount,
        balanceAfter: studentSavings.balanceAfter,
        date: studentSavings.date,
        student: {
          id: students.id,
          name: students.name,
          nis: students.nis,
        }
      })
      .from(studentSavings)
      .leftJoin(students, eq(studentSavings.studentId, students.id))
      .where(isNull(studentSavings.deletedAt))
      .orderBy(desc(studentSavings.date), desc(studentSavings.id));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch savings error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data tabungan" }, { status: 500 });
  }
}
