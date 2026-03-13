import { NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, classrooms, subjects, employees, academicYears } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomIdParam = searchParams.get("classroomId");
    const employeeIdParam = searchParams.get("employeeId");
    const dayParam = searchParams.get("day");
    const academicYearIdParam = searchParams.get("academicYearId");

    const conditions = [];
    if (classroomIdParam) conditions.push(eq(schedules.classroomId, parseInt(classroomIdParam)));
    if (employeeIdParam) conditions.push(eq(schedules.employeeId, parseInt(employeeIdParam)));
    if (dayParam) conditions.push(eq(schedules.day, dayParam));
    if (academicYearIdParam) conditions.push(eq(schedules.academicYearId, parseInt(academicYearIdParam)));

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const offset = (page - 1) * limit;

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: schedules.id,
          classroomId: schedules.classroomId,
          subjectId: schedules.subjectId,
          employeeId: schedules.employeeId,
          academicYearId: schedules.academicYearId,
          day: schedules.day,
          startTime: schedules.startTime,
          endTime: schedules.endTime,
          unitId: schedules.unitId,
          createdAt: schedules.createdAt,
          updatedAt: schedules.updatedAt,
          classroom: { name: classrooms.name },
          subject: { name: subjects.name, code: subjects.code },
          employee: { name: employees.name },
          academicYear: { year: academicYears.year, isActive: academicYears.isActive },
        })
        .from(schedules)
        .leftJoin(classrooms, eq(schedules.classroomId, classrooms.id))
        .leftJoin(subjects, eq(schedules.subjectId, subjects.id))
        .leftJoin(employees, eq(schedules.employeeId, employees.id))
        .leftJoin(academicYears, eq(schedules.academicYearId, academicYears.id))
        .where(whereClause)
        .orderBy(asc(schedules.day), asc(schedules.startTime))
        .limit(limit)
        .offset(offset),
      db.select({ id: schedules.id }).from(schedules).where(whereClause),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows.length,
        page,
        limit,
        totalPages: Math.ceil(countRows.length / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classroomId, subjectId, employeeId, day, startTime, endTime, academicYearId } = body;

    if (!classroomId || !subjectId || !employeeId || day === undefined || !startTime || !endTime || !academicYearId) {
      return NextResponse.json({
        success: false,
        error: "Kelas, Mapel, Guru, Hari, Jam Mulai, Jam Selesai, dan Tahun Ajaran wajib diisi",
      }, { status: 400 });
    }

    const [newSchedule] = await db
      .insert(schedules)
      .values({
        classroomId: parseInt(classroomId),
        subjectId: parseInt(subjectId),
        employeeId: parseInt(employeeId),
        academicYearId: parseInt(academicYearId),
        day,
        startTime,
        endTime,
      })
      .returning();

    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
