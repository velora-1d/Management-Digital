import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendances, students, studentEnrollments, academicYears } from "@/db/schema";
import { and, eq, gte, isNull, lte, asc, sql } from "drizzle-orm";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan server";
}

// GET: Rekapitulasi absensi siswa per periode per kelas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const academicYearId = searchParams.get("academicYearId");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    if (!classroomId || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: "classroomId, startDate, dan endDate wajib diisi",
      }, { status: 400 });
    }

    const cId = parseInt(classroomId);
    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;

    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    // 1. Hitung total murid aktif di kelas ini (untuk pagination)
    const countRes = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .where(and(
        eq(studentEnrollments.classroomId, cId),
        targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
        isNull(studentEnrollments.deletedAt),
        isNull(students.deletedAt)
      ));
    
    const totalStudents = countRes[0].count;

    // 2. Ambil Rekap menggunakan SQL Aggregation (Grouping per Student)
    // Ini jauh lebih cepat daripada mengambil ribuah data lalu mem-filter di JS
    const recap = await db
      .select({
        id: students.id,
        nisn: students.nisn,
        name: students.name,
        hadir: sql<number>`count(case when ${attendances.status} = 'hadir' then 1 end)`.mapWith(Number),
        sakit: sql<number>`count(case when ${attendances.status} = 'sakit' then 1 end)`.mapWith(Number),
        izin: sql<number>`count(case when ${attendances.status} = 'izin' then 1 end)`.mapWith(Number),
        alpha: sql<number>`count(case when ${attendances.status} = 'alpha' then 1 end)`.mapWith(Number),
        total: sql<number>`count(${attendances.status})`.mapWith(Number),
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(
        attendances,
        and(
          eq(students.id, attendances.studentId),
          gte(attendances.date, startDate),
          lte(attendances.date, endDate),
          eq(attendances.classroomId, cId),
          targetAcademicYearId ? eq(attendances.academicYearId, targetAcademicYearId) : undefined
        )
      )
      .where(and(
        eq(studentEnrollments.classroomId, cId),
        targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
        isNull(studentEnrollments.deletedAt),
        isNull(students.deletedAt)
      ))
      .groupBy(students.id)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset(offset);

    const formattedData = recap.map(r => ({
      id: r.id,
      nisn: r.nisn,
      name: r.name,
      stats: {
        hadir: r.hadir,
        sakit: r.sakit,
        izin: r.izin,
        alpha: r.alpha,
        total: r.total,
      }
    }));

    const response = NextResponse.json({
      success: true,
      data: formattedData,
      meta: { total: totalStudents, page, limit, totalPages: Math.ceil(totalStudents / limit) },
    });

    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
