import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Rekapitulasi absensi siswa per periode per kelas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('classroomId');
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate'); // YYYY-MM-DD

    const page = parseInt(searchParams.get('page') || "1");
    const limit = parseInt(searchParams.get('limit') || "10");
    const skip = (page - 1) * limit;

    if (!classroomId || !startDate || !endDate) {
      return NextResponse.json({ 
        success: false, 
        error: "classroomId, startDate, dan endDate wajib diisi" 
      }, { status: 400 });
    }

    // Ambil total murid untuk metadata paginasi
    const totalStudents = await prisma.student.count({
      where: {
        classroomId: parseInt(classroomId),
        deletedAt: null,
      }
    });

    // Ambil murid di kelas ini dengan paginasi
    const students = await prisma.student.findMany({
      where: {
        classroomId: parseInt(classroomId),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        nisn: true,
      },
      orderBy: { name: 'asc' },
      skip: limit > 0 ? skip : undefined,
      take: limit > 0 ? limit : undefined,
    });

    if (!students || students.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        meta: { 
          total: totalStudents, 
          page, 
          limit, 
          totalPages: limit > 0 ? Math.ceil(totalStudents / limit) : 1 
        } 
      });
    }

    // Ambil data absensi dalam range tanggal yang diminta untuk kelas tersebut
    const attendances = await prisma.attendance.findMany({
      where: {
        classroomId: parseInt(classroomId),
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Kalkulasi rekap per murid
    const recap = students.map(student => {
      // Filter catatan absensi punya murid ini saja
      const studentAttendances = attendances.filter(a => a.studentId === student.id);
      
      const hadir = studentAttendances.filter(a => a.status === 'hadir').length;
      const sakit = studentAttendances.filter(a => a.status === 'sakit').length;
      const izin = studentAttendances.filter(a => a.status === 'izin').length;
      const alpha = studentAttendances.filter(a => a.status === 'alpha').length;

      return {
        id: student.id,
        nisn: student.nisn,
        name: student.name,
        stats: {
          hadir,
          sakit,
          izin,
          alpha,
          total: hadir + sakit + izin + alpha
        }
      };
    });

    return NextResponse.json({ success: true, data: recap }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
