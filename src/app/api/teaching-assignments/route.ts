import { NextResponse } from "next/server";
import { db } from "@/db";
import { teachingAssignments, employees, subjects, classrooms, academicYears } from "@/db/schema";
import { isNull, and, eq, desc, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const subjectId = searchParams.get('subjectId');
    const classroomId = searchParams.get('classroomId');
    const academicYearId = searchParams.get('academicYearId');

    const conditions = [isNull(teachingAssignments.deletedAt)];
    if (employeeId) conditions.push(eq(teachingAssignments.employeeId, parseInt(employeeId)));
    if (subjectId) conditions.push(eq(teachingAssignments.subjectId, parseInt(subjectId)));
    if (classroomId) conditions.push(eq(teachingAssignments.classroomId, parseInt(classroomId)));
    if (academicYearId) conditions.push(eq(teachingAssignments.academicYearId, parseInt(academicYearId)));

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const whereClause = and(...conditions);

    const [rawData, [{ total }]] = await Promise.all([
      db.select({
        id: teachingAssignments.id,
        employeeId: teachingAssignments.employeeId,
        subjectId: teachingAssignments.subjectId,
        classroomId: teachingAssignments.classroomId,
        academicYearId: teachingAssignments.academicYearId,
        createdAt: teachingAssignments.createdAt,
        updatedAt: teachingAssignments.updatedAt,
        employeeName: employees.name,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        subjectType: subjects.type,
        classroomName: classrooms.name,
        academicYearName: academicYears.year,
        academicYearIsActive: academicYears.isActive,
      })
      .from(teachingAssignments)
      .leftJoin(employees, eq(teachingAssignments.employeeId, employees.id))
      .leftJoin(subjects, eq(teachingAssignments.subjectId, subjects.id))
      .leftJoin(classrooms, eq(teachingAssignments.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(teachingAssignments.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(desc(teachingAssignments.createdAt))
      .limit(limit)
      .offset(skip),
      
      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(teachingAssignments)
      .where(whereClause)
    ]);

    const assignments = rawData.map(r => ({
      id: r.id,
      employeeId: r.employeeId,
      subjectId: r.subjectId,
      classroomId: r.classroomId,
      academicYearId: r.academicYearId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      employee: { id: r.employeeId, name: r.employeeName },
      subject: { id: r.subjectId, name: r.subjectName, code: r.subjectCode, type: r.subjectType },
      classroom: { id: r.classroomId, name: r.classroomName },
      academicYear: { id: r.academicYearId, year: r.academicYearName, isActive: r.academicYearIsActive },
    }));

    return NextResponse.json({ 
      success: true, 
      data: assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, subjectId, classroomId, academicYearId } = body;

    if (!employeeId || !subjectId || !classroomId || !academicYearId) {
      return NextResponse.json({ 
        success: false, 
        error: "Guru, Mata Pelajaran, Kelas, dan Tahun Ajaran wajib diisi" 
      }, { status: 400 });
    }

    // Check for duplicate assignment
    const [existing] = await db.select({ id: teachingAssignments.id })
      .from(teachingAssignments)
      .where(and(
        eq(teachingAssignments.employeeId, parseInt(employeeId)),
        eq(teachingAssignments.subjectId, parseInt(subjectId)),
        eq(teachingAssignments.classroomId, parseInt(classroomId)),
        eq(teachingAssignments.academicYearId, parseInt(academicYearId)),
        isNull(teachingAssignments.deletedAt)
      ))
      .limit(1);

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Penugasan untuk guru, mapel, kelas, dan tahun ajaran tersebut sudah ada" 
      }, { status: 400 });
    }

    const [newAssignment] = await db.insert(teachingAssignments).values({
      employeeId: parseInt(employeeId),
      subjectId: parseInt(subjectId),
      classroomId: parseInt(classroomId),
      academicYearId: parseInt(academicYearId)
    }).returning();

    return NextResponse.json({ success: true, data: newAssignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
