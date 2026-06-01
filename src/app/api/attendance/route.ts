import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendances, students, studentEnrollments, academicYears } from "@/db/schema";
import { and, eq, isNull, asc, sql } from "drizzle-orm";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan server";
}

// GET: Fetch attendance untuk kelas dan tanggal tertentu (Optimized: Join Students)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const dateQuery = searchParams.get("date");
    const academicYearId = searchParams.get("academicYearId");

    if (!classroomId || !dateQuery) {
      return NextResponse.json({ success: false, error: "classroomId dan date wajib diisi" }, { status: 400 });
    }

    const dateStr = new Date(dateQuery).toISOString().split("T")[0];
    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;

    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    // Optimasi: Ambil ALL students di kelas tsb, lalu LEFT JOIN ke attendance pada tanggal tsb
    // Dengan ini, client cukup panggil SATU API ini saja untuk daftar abensi
    const rows = await db
      .select({
        studentId: students.id,
        studentName: students.name,
        nisn: students.nisn,
        attendanceId: attendances.id,
        status: attendances.status,
        note: attendances.note,
        isNotified: attendances.isNotified,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(
        attendances,
        and(
          eq(attendances.studentId, students.id),
          eq(attendances.date, dateStr),
          targetAcademicYearId ? eq(attendances.academicYearId, targetAcademicYearId) : undefined
        )
      )
      .where(
        and(
          eq(studentEnrollments.classroomId, parseInt(classroomId)),
          targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
          isNull(studentEnrollments.deletedAt),
          isNull(students.deletedAt)
        )
      )
      .orderBy(asc(students.name));

    const response = NextResponse.json({ 
      success: true, 
      data: rows.map(r => ({
        id: r.attendanceId,
        studentId: r.studentId,
        status: r.status || "hadir", // Default frontend logic
        note: r.note || "",
        student: { name: r.studentName, nisn: r.nisn }
      })) 
    });

    // Cache pendek untuk meredam spam refresh saat input
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST: Mass Upsert Attendance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classroomId, academicYearId, date, attendances: attendanceList } = body;

    if (!classroomId || !date || !Array.isArray(attendanceList)) {
      return NextResponse.json({
        success: false,
        error: "classroomId, date, dan array attendances wajib diisi",
      }, { status: 400 });
    }

    const dateStr = new Date(date).toISOString().split("T")[0];

    const results = await db
      .insert(attendances)
      .values(
        attendanceList.map((att: { studentId: number; status: string; notes?: string }) => ({
          studentId: att.studentId,
          classroomId: parseInt(classroomId),
          academicYearId: academicYearId ? parseInt(academicYearId) : null,
          date: dateStr,
          status: att.status,
          note: att.notes || "",
        }))
      )
      .onConflictDoUpdate({
        target: [attendances.studentId, attendances.date],
        set: {
          status: sql`excluded.status`,
          note: sql`excluded.note`,
          classroomId: sql`excluded.classroom_id`,
          academicYearId: sql`excluded.academic_year_id`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
