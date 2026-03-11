import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const subjectId = searchParams.get('subjectId');
    const classroomId = searchParams.get('classroomId');
    const academicYearId = searchParams.get('academicYearId');

    const filter: any = {
      deletedAt: null,
    };

    if (employeeId) filter.employeeId = parseInt(employeeId);
    if (subjectId) filter.subjectId = parseInt(subjectId);
    if (classroomId) filter.classroomId = parseInt(classroomId);
    if (academicYearId) filter.academicYearId = parseInt(academicYearId);

    const assignments = await prisma.teachingAssignment.findMany({
      where: filter,
      include: {
        employee: {
          select: { id: true, name: true }
        },
        subject: {
          select: { id: true, name: true, code: true, type: true }
        },
        classroom: {
          select: { id: true, name: true }
        },
        academicYear: {
          select: { id: true, year: true, isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, subjectId, classroomId, academicYearId } = body;

    // Validate required fields
    if (!employeeId || !subjectId || !classroomId || !academicYearId) {
      return NextResponse.json({ 
        success: false, 
        error: "Guru, Mata Pelajaran, Kelas, dan Tahun Ajaran wajib diisi" 
      }, { status: 400 });
    }

    // Check for duplicate assignment
    const existing = await prisma.teachingAssignment.findFirst({
      where: {
        employeeId: parseInt(employeeId),
        subjectId: parseInt(subjectId),
        classroomId: parseInt(classroomId),
        academicYearId: parseInt(academicYearId),
        deletedAt: null
      }
    });

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Penugasan untuk guru, mapel, kelas, dan tahun ajaran tersebut sudah ada" 
      }, { status: 400 });
    }

    const newAssignment = await prisma.teachingAssignment.create({
      data: {
        employeeId: parseInt(employeeId),
        subjectId: parseInt(subjectId),
        classroomId: parseInt(classroomId),
        academicYearId: parseInt(academicYearId)
      },
      include: {
        employee: { select: { name: true } },
        subject: { select: { name: true } },
        classroom: { select: { name: true } },
      }
    });

    return NextResponse.json({ success: true, data: newAssignment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
