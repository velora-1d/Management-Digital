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

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        classroom: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        employee: { select: { name: true } },
        academicYear: { select: { year: true, isActive: true } }
      }
    });

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

    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ success: false, error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (classroomId) updateData.classroomId = parseInt(classroomId);
    if (subjectId) updateData.subjectId = parseInt(subjectId);
    if (employeeId) updateData.employeeId = parseInt(employeeId);
    if (academicYearId) updateData.academicYearId = parseInt(academicYearId);
    if (day !== undefined) updateData.day = parseInt(day);
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        classroom: { select: { name: true } },
        subject: { select: { name: true } },
        employee: { select: { name: true } },
      }
    });

    return NextResponse.json({ success: true, data: updatedSchedule });
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

    // Hard delete since not in schema
    await prisma.schedule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Jadwal berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
