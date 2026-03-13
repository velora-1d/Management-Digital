import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachingAssignments, employees, subjects, classrooms, academicYears } from "@/db/schema";
import { and, eq, isNull, ne } from "drizzle-orm";

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

    const [assignment] = await db
      .select({
        id: teachingAssignments.id,
        employeeId: teachingAssignments.employeeId,
        subjectId: teachingAssignments.subjectId,
        classroomId: teachingAssignments.classroomId,
        academicYearId: teachingAssignments.academicYearId,
        unitId: teachingAssignments.unitId,
        createdAt: teachingAssignments.createdAt,
        updatedAt: teachingAssignments.updatedAt,
        deletedAt: teachingAssignments.deletedAt,
        employee: { id: employees.id, name: employees.name },
        subject: { id: subjects.id, name: subjects.name, code: subjects.code, type: subjects.type },
        classroom: { id: classrooms.id, name: classrooms.name },
        academicYear: { year: academicYears.year, isActive: academicYears.isActive },
      })
      .from(teachingAssignments)
      .leftJoin(employees, eq(teachingAssignments.employeeId, employees.id))
      .leftJoin(subjects, eq(teachingAssignments.subjectId, subjects.id))
      .leftJoin(classrooms, eq(teachingAssignments.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(teachingAssignments.academicYearId, academicYears.id))
      .where(and(eq(teachingAssignments.id, id), isNull(teachingAssignments.deletedAt)));

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: assignment });
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
    const { employeeId, subjectId, classroomId, academicYearId } = body;

    const [existing] = await db
      .select()
      .from(teachingAssignments)
      .where(and(eq(teachingAssignments.id, id), isNull(teachingAssignments.deletedAt)));

    if (!existing) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 });
    }

    // Cek duplikasi
    if (employeeId || subjectId || classroomId || academicYearId) {
      const eId = employeeId ? parseInt(employeeId) : existing.employeeId;
      const sId = subjectId ? parseInt(subjectId) : existing.subjectId;
      const cId = classroomId ? parseInt(classroomId) : existing.classroomId;
      const aId = academicYearId ? parseInt(academicYearId) : existing.academicYearId;

      const duplicates = await db
        .select({ id: teachingAssignments.id })
        .from(teachingAssignments)
        .where(
          and(
            ne(teachingAssignments.id, id),
            eq(teachingAssignments.employeeId, eId!),
            eq(teachingAssignments.subjectId, sId!),
            eq(teachingAssignments.classroomId, cId!),
            eq(teachingAssignments.academicYearId, aId!),
            isNull(teachingAssignments.deletedAt)
          )
        );

      if (duplicates.length > 0) {
        return NextResponse.json({
          success: false,
          error: "Penugasan untuk guru, mapel, kelas, dan tahun ajaran tersebut sudah ada",
        }, { status: 400 });
      }
    }

    const updateData: Partial<typeof teachingAssignments.$inferInsert> = { updatedAt: new Date() };
    if (employeeId) updateData.employeeId = parseInt(employeeId);
    if (subjectId) updateData.subjectId = parseInt(subjectId);
    if (classroomId) updateData.classroomId = parseInt(classroomId);
    if (academicYearId) updateData.academicYearId = parseInt(academicYearId);

    const [updated] = await db
      .update(teachingAssignments)
      .set(updateData)
      .where(eq(teachingAssignments.id, id))
      .returning();

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

    const existing = await db
      .select({ id: teachingAssignments.id })
      .from(teachingAssignments)
      .where(and(eq(teachingAssignments.id, id), isNull(teachingAssignments.deletedAt)));

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 });
    }

    // Soft delete
    await db
      .update(teachingAssignments)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(teachingAssignments.id, id));

    return NextResponse.json({ success: true, message: "Penugasan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
