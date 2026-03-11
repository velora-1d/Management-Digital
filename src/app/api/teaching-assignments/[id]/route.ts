import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id, deletedAt: null },
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
          select: { year: true, isActive: true }
        }
      }
    });

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

    const existingAssignment = await prisma.teachingAssignment.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingAssignment) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 });
    }

    // Check for duplicate assignment if any of these fields are changing
    if (employeeId || subjectId || classroomId || academicYearId) {
      const eId = employeeId ? parseInt(employeeId) : existingAssignment.employeeId;
      const sId = subjectId ? parseInt(subjectId) : existingAssignment.subjectId;
      const cId = classroomId ? parseInt(classroomId) : existingAssignment.classroomId;
      const aId = academicYearId ? parseInt(academicYearId) : existingAssignment.academicYearId;

      const duplicate = await prisma.teachingAssignment.findFirst({
        where: {
          id: { not: id },
          employeeId: eId,
          subjectId: sId,
          classroomId: cId,
          academicYearId: aId,
          deletedAt: null
        }
      });

      if (duplicate) {
        return NextResponse.json({ 
          success: false, 
          error: "Penugasan untuk guru, mapel, kelas, dan tahun ajaran tersebut sudah ada" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (employeeId) updateData.employeeId = parseInt(employeeId);
    if (subjectId) updateData.subjectId = parseInt(subjectId);
    if (classroomId) updateData.classroomId = parseInt(classroomId);
    if (academicYearId) updateData.academicYearId = parseInt(academicYearId);

    const updatedAssignment = await prisma.teachingAssignment.update({
      where: { id },
      data: updateData,
      include: {
        employee: { select: { name: true } },
        subject: { select: { name: true } },
        classroom: { select: { name: true } },
      }
    });

    return NextResponse.json({ success: true, data: updatedAssignment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const existingAssignment = await prisma.teachingAssignment.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingAssignment) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 });
    }

    // Soft delete
    await prisma.teachingAssignment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Penugasan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
