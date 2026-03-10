import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const month = searchParams.get("month") || "";
  const semester = searchParams.get("semester") || "";
  const academicYearId = searchParams.get("academicYearId") || "";
  const classroomId = searchParams.get("classroomId") || "";
  const gender = searchParams.get("gender") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

  try {
    // 1. Tentukan Tahun Ajaran Target
    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
      });
      targetAcademicYearId = activeYear?.id || null;
    }

    // 2. Build where clause
    const where: any = { deletedAt: null };
    
    if (targetAcademicYearId) where.academicYearId = targetAcademicYearId;
    if (month) where.month = month;
    if (statusFilter) where.status = statusFilter;

    // Filter Semester
    if (semester) {
      const ganjilMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const genapMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      where.month = { in: semester.toLowerCase() === "ganjil" ? ganjilMonths : genapMonths };
    }

    // Filter Relasi Siswa
    if (search || classroomId || gender) {
      where.student = {
        deletedAt: null,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        ...(classroomId ? { classroomId: Number(classroomId) } : {}),
        ...(gender ? { gender } : {}),
      };
    }

    const [bills, total] = await Promise.all([
      prisma.infaqBill.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, nisn: true, classroomId: true, gender: true },
          },
          academicYear: {
            select: { id: true, year: true },
          },
          payments: {
            where: { deletedAt: null },
            select: { amountPaid: true },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.infaqBill.count({ where }),
    ]);

    // Ambil semua Classroom ID unik untuk mapping nama kelas
    const classIds = [...new Set(bills.map(b => b.student?.classroomId).filter((id): id is number => id != null))];
    const classrooms = classIds.length > 0 
      ? await prisma.classroom.findMany({ where: { id: { in: classIds } }, select: { id: true, name: true } }) 
      : [];
    const classMap = Object.fromEntries(classrooms.map(c => [c.id, c.name]));

    const formattedBills = bills.map(b => {
      const totalPaid = b.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        id: b.id,
        student_id: b.studentId,
        student_name: b.student?.name || "Unknown",
        nisn: b.student?.nisn || "-",
        gender: b.student?.gender || "-",
        classroom: b.student?.classroomId ? classMap[b.student.classroomId] || "-" : "-",
        academic_year: b.academicYear?.year || "-",
        month: b.month,
        year: b.year,
        nominal: b.nominal,
        total_paid: totalPaid,
        remaining: Math.max(0, b.nominal - totalPaid),
        status: b.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedBills,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Infaq bills GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
