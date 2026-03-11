import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch attendance for a specific class and date
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroomId');
    const dateQuery = searchParams.get('date'); // YYYY-MM-DD format
    
    if (!classroomId || !dateQuery) {
      return NextResponse.json({ success: false, error: "classroomId dan date wajib diisi" }, { status: 400 });
    }

    const dateStr = new Date(dateQuery).toISOString().split('T')[0];

    const attendances = await prisma.attendance.findMany({
      where: {
        classroomId: parseInt(classroomId),
        date: dateStr
      },
      include: {
        student: { select: { name: true, nisn: true } }
      }
    });

    return NextResponse.json({ success: true, data: attendances });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Mass Insert or Upsert Attendance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classroomId, academicYearId, date, attendances } = body;
    // attendances is an array of objects: { studentId, status, notes }

    if (!classroomId || !academicYearId || !date || !Array.isArray(attendances)) {
      return NextResponse.json({ 
        success: false, 
        error: "classroomId, academicYearId, date, dan array attendances wajib diisi" 
      }, { status: 400 });
    }

    const dateStr = new Date(date).toISOString().split('T')[0];

    // Using transaction for safe mass insert/update
    const results = await prisma.$transaction(
      attendances.map((att: { studentId: number, status: string, notes?: string }) => {
        return prisma.attendance.upsert({
          where: {
            unique_attendance: {
              studentId: att.studentId,
              date: dateStr
            }
          },
          update: {
            status: att.status,
            note: att.notes || "",
            classroomId: parseInt(classroomId),
          },
          create: {
            studentId: att.studentId,
            classroomId: parseInt(classroomId),
            date: dateStr,
            status: att.status,
            note: att.notes || ""
          }
        });
      })
    );

    return NextResponse.json({ success: true, count: results.length, data: results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
