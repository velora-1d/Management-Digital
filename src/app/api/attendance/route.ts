import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendances, students } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

// GET: Fetch attendance untuk kelas dan tanggal tertentu
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const dateQuery = searchParams.get("date");

    if (!classroomId || !dateQuery) {
      return NextResponse.json({ success: false, error: "classroomId dan date wajib diisi" }, { status: 400 });
    }

    const dateStr = new Date(dateQuery).toISOString().split("T")[0];

    const rows = await db
      .select({
        id: attendances.id,
        studentId: attendances.studentId,
        classroomId: attendances.classroomId,
        date: attendances.date,
        status: attendances.status,
        note: attendances.note,
        createdAt: attendances.createdAt,
        updatedAt: attendances.updatedAt,
        student: { name: students.name, nisn: students.nisn },
      })
      .from(attendances)
      .leftJoin(students, eq(attendances.studentId, students.id))
      .where(and(eq(attendances.classroomId, parseInt(classroomId)), eq(attendances.date, dateStr)));

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Mass Upsert Attendance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classroomId, date, attendances: attendanceList } = body;

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
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
