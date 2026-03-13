import { NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, classrooms, subjects, employees, academicYears } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const [schedule] = await db
      .select({
        id: schedules.id,
        classroomId: schedules.classroomId,
        subjectId: schedules.subjectId,
        employeeId: schedules.employeeId,
        academicYearId: schedules.academicYearId,
        day: schedules.day,
        startTime: schedules.startTime,
        endTime: schedules.endTime,
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
      .where(eq(schedules.id, id));

    if (!schedule) {
      return NextResponse.json({ success: false, error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { classroomId, subjectId, employeeId, day, startTime, endTime, academicYearId } = body;

    const existing = await db.select({ id: schedules.id }).from(schedules).where(eq(schedules.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    const updateData: Partial<typeof schedules.$inferInsert> = {};
    if (classroomId) updateData.classroomId = parseInt(classroomId);
    if (subjectId) updateData.subjectId = parseInt(subjectId);
    if (employeeId) updateData.employeeId = parseInt(employeeId);
    if (academicYearId) updateData.academicYearId = parseInt(academicYearId);
    if (day !== undefined) updateData.day = day;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    updateData.updatedAt = new Date();

    const [updated] = await db.update(schedules).set(updateData).where(eq(schedules.id, id)).returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await db.delete(schedules).where(eq(schedules.id, id));

    return NextResponse.json({ success: true, message: "Jadwal berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
