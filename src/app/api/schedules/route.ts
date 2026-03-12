import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroomId');
    const employeeId = searchParams.get('employeeId');
    const day = searchParams.get('day');
    const academicYearId = searchParams.get('academicYearId');

    const filter: any = {};

    if (classroomId) filter.classroomId = parseInt(classroomId);
    if (employeeId) filter.employeeId = parseInt(employeeId);
    if (day) filter.day = parseInt(day);
    if (academicYearId) filter.academicYearId = parseInt(academicYearId);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000"); // Default tinggi karena jadwal biasanya butuh semua data per kriteria
    const skip = (page - 1) * limit;

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where: filter,
        include: {
          classroom: { select: { name: true } },
          subject: { select: { name: true, code: true } },
          employee: { select: { name: true } },
          academicYear: { select: { year: true, isActive: true } }
        },
        orderBy: [
          { day: 'asc' },
          { startTime: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.schedule.count({ where: filter })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: schedules,
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
    const { classroomId, subjectId, employeeId, day, startTime, endTime, academicYearId } = body;

    // Validate required fields
    if (!classroomId || !subjectId || !employeeId || day === undefined || !startTime || !endTime || !academicYearId) {
      return NextResponse.json({ 
        success: false, 
        error: "Kelas, Mapel, Guru, Hari, Jam Mulai, Jam Selesai, dan Tahun Ajaran wajib diisi" 
      }, { status: 400 });
    }

    // Optional: Basic validation to prevent time clash for the same employee or classroom
    // In a real app, we'd do a time overlap check. Here we just ensure we have the data.
    
    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId: parseInt(classroomId),
        subjectId: parseInt(subjectId),
        employeeId: parseInt(employeeId),
        academicYearId: parseInt(academicYearId),
        day,
        startTime,
        endTime
      },
      include: {
        classroom: { select: { name: true } },
        subject: { select: { name: true } },
        employee: { select: { name: true } },
      }
    });

    return NextResponse.json({ success: true, data: newSchedule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
