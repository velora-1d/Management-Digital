import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentEnrollments, students, classrooms, academicYears } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/mutations — Ambil daftar riwayat mutasi/kenaikan kelas
 */
export async function GET() {
  try {
    await requireAuth();

    const data = await db
      .select({
        id: studentEnrollments.id,
        enrollmentType: studentEnrollments.enrollmentType,
        notes: studentEnrollments.notes,
        createdAt: studentEnrollments.createdAt,
        student: {
          id: students.id,
          name: students.name,
          nis: students.nis,
        },
        classroom: {
          id: classrooms.id,
          name: classrooms.name,
        },
        academicYear: {
          id: academicYears.id,
          year: academicYears.year,
        }
      })
      .from(studentEnrollments)
      .leftJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(studentEnrollments.academicYearId, academicYears.id))
      .where(
        and(
          eq(studentEnrollments.enrollmentType, "mutasi"),
          isNull(studentEnrollments.deletedAt)
        )
      )
      .orderBy(desc(studentEnrollments.createdAt));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch mutations error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data mutasi" }, { status: 500 });
  }
}
