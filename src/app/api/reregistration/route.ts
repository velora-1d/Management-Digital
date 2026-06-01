import { NextResponse } from "next/server";
import { db } from "@/db";
import { reRegistrations, students, academicYears } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/reregistration — Ambil daftar konfirmasi daftar ulang siswa lama
 */
export async function GET() {
  try {
    await requireAuth();

    const data = await db
      .select({
        id: reRegistrations.id,
        status: reRegistrations.status,
        confirmedAt: reRegistrations.confirmedAt,
        notes: reRegistrations.notes,
        createdAt: reRegistrations.createdAt,
        student: {
          id: students.id,
          name: students.name,
          nis: students.nis,
        },
        academicYear: {
          id: academicYears.id,
          year: academicYears.year,
        }
      })
      .from(reRegistrations)
      .leftJoin(students, eq(reRegistrations.studentId, students.id))
      .leftJoin(academicYears, eq(reRegistrations.academicYearId, academicYears.id))
      .where(isNull(reRegistrations.deletedAt))
      .orderBy(desc(reRegistrations.createdAt));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch reregistrations error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data daftar ulang" }, { status: 500 });
  }
}
