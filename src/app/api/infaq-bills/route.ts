import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, students, academicYears, classrooms, infaqPayments } from "@/db/schema";
import { isNull, and, eq, ilike, asc, desc, sql, inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const month = searchParams.get("month") || "";
  const semester = searchParams.get("semester") || "";
  const academicYearId = searchParams.get("academicYearId") || "";
  const classroomId = searchParams.get("classroomId") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

  try {
    // 1. Tentukan Tahun Ajaran Target
    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;
    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    // 2. Build where clause
    const conditions = [isNull(infaqBills.deletedAt)];
    if (targetAcademicYearId) conditions.push(eq(infaqBills.academicYearId, targetAcademicYearId));
    if (month) conditions.push(eq(infaqBills.month, month));
    if (statusFilter) conditions.push(eq(infaqBills.status, statusFilter as any));

    // Filter Semester
    if (semester) {
      const ganjilMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const genapMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      const monthList = semester.toLowerCase() === "ganjil" ? ganjilMonths : genapMonths;
      conditions.push(inArray(infaqBills.month, monthList));
    }

    // Filter Relasi Siswa
    if (search) conditions.push(ilike(students.name, `%${search}%`));
    if (classroomId) conditions.push(eq(students.classroomId, Number(classroomId)));

    const whereClause = and(...conditions);

    const [rawBills, [{ total }]] = await Promise.all([
      db.select({
        id: infaqBills.id,
        studentId: infaqBills.studentId,
        month: infaqBills.month,
        year: infaqBills.year,
        nominal: infaqBills.nominal,
        status: infaqBills.status,
        createdAt: infaqBills.createdAt,
        studentName: students.name,
        studentNisn: students.nisn,
        studentGender: students.gender,
        studentClassroomId: students.classroomId,
        academicYearName: academicYears.year,
      })
      .from(infaqBills)
      .leftJoin(students, eq(infaqBills.studentId, students.id))
      .leftJoin(academicYears, eq(infaqBills.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(desc(infaqBills.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(infaqBills)
      .leftJoin(students, eq(infaqBills.studentId, students.id))
      .where(whereClause)
    ]);

    // Ambil total pembayaran per bill
    const billIds = rawBills.map(b => b.id);
    let paymentMap: Record<number, number> = {};
    if (billIds.length > 0) {
      const paymentSums = await db.select({
        billId: infaqPayments.billId,
        totalPaid: sql<number>`coalesce(sum(${infaqPayments.amountPaid}), 0)`.mapWith(Number),
      })
      .from(infaqPayments)
      .where(and(inArray(infaqPayments.billId, billIds), isNull(infaqPayments.deletedAt)))
      .groupBy(infaqPayments.billId);
      
      paymentSums.forEach(p => { 
        if (p.billId !== null) {
          paymentMap[p.billId] = p.totalPaid; 
        }
      });
    }

    // Ambil nama kelas
    const classIds = [...new Set(rawBills.map(b => b.studentClassroomId).filter((id): id is number => id != null))];
    let classMap: Record<number, string> = {};
    if (classIds.length > 0) {
      const cls = await db.select({ id: classrooms.id, name: classrooms.name }).from(classrooms).where(inArray(classrooms.id, classIds));
      cls.forEach(c => { classMap[c.id] = c.name; });
    }

    const formattedBills = rawBills.map(b => {
      const totalPaid = paymentMap[b.id] || 0;
      return {
        id: b.id,
        student_id: b.studentId,
        student_name: b.studentName || "Unknown",
        nisn: b.studentNisn || "-",
        gender: b.studentGender || "-",
        classroom: b.studentClassroomId ? classMap[b.studentClassroomId] || "-" : "-",
        academic_year: b.academicYearName || "-",
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
