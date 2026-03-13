import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendances, students } from "@/db/schema";
import { and, eq, gte, isNull, lte, asc } from "drizzle-orm";

// GET: Rekapitulasi absensi siswa per periode per kelas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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

    // Ambil semua murid aktif di kelas ini
    const allStudents = await db
      .select({ id: students.id, name: students.name, nisn: students.nisn })
      .from(students)
      .where(and(eq(students.classroomId, cId), isNull(students.deletedAt)))
      .orderBy(asc(students.name));

    const totalStudents = allStudents.length;
    const paginated = limit > 0 ? allStudents.slice(offset, offset + limit) : allStudents;

    if (paginated.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { total: totalStudents, page, limit, totalPages: limit > 0 ? Math.ceil(totalStudents / limit) : 1 },
      });
    }

    // Ambil absensi dalam range tanggal untuk kelas ini
    const attendanceData = await db
      .select()
      .from(attendances)
      .where(
        and(
          eq(attendances.classroomId, cId),
          gte(attendances.date, startDate),
          lte(attendances.date, endDate)
        )
      );

    // Kalkulasi rekap per murid
    const recap = paginated.map((student) => {
      const studentAttendances = attendanceData.filter((a) => a.studentId === student.id);
      const hadir = studentAttendances.filter((a) => a.status === "hadir").length;
      const sakit = studentAttendances.filter((a) => a.status === "sakit").length;
      const izin = studentAttendances.filter((a) => a.status === "izin").length;
      const alpha = studentAttendances.filter((a) => a.status === "alpha").length;

      return {
        id: student.id,
        nisn: student.nisn,
        name: student.name,
        stats: { hadir, sakit, izin, alpha, total: hadir + sakit + izin + alpha },
      };
    });

    return NextResponse.json({
      success: true,
      data: recap,
      meta: { total: totalStudents, page, limit, totalPages: limit > 0 ? Math.ceil(totalStudents / limit) : 1 },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
