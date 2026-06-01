import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, students, academicYears, infaqPayments, studentEnrollments } from "@/db/schema";
import { isNull, and, eq, ilike, inArray, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const month = searchParams.get("month") || "";
  const semester = searchParams.get("semester") || "";
  const academicYearId = searchParams.get("academicYearId") || "";
  const classroomId = searchParams.get("classroomId") || "";
  const gender = searchParams.get("gender") || "";
  const statusFilter = searchParams.get("status") || "";

  try {
    // 1. Tentukan Tahun Ajaran Target
    let targetAcademicYearId: number | null = null;
    if (academicYearId !== "all") {
      targetAcademicYearId = academicYearId ? Number(academicYearId) : null;
      if (!targetAcademicYearId) {
        const [activeYear] = await db.select({ id: academicYears.id })
          .from(academicYears)
          .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
          .limit(1);
        targetAcademicYearId = activeYear?.id || null;
      }
    }

    // 2. Build where clause
    const conditions = [isNull(infaqBills.deletedAt), isNull(students.deletedAt), isNull(studentEnrollments.deletedAt)];
    if (targetAcademicYearId) conditions.push(eq(infaqBills.academicYearId, targetAcademicYearId));
    if (month) conditions.push(eq(infaqBills.month, month));
    if (statusFilter && statusFilter !== "all") conditions.push(eq(infaqBills.status, statusFilter));

    // Filter Semester
    if (semester) {
      const ganjilMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const genapMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      const monthList = semester.toLowerCase() === "ganjil" ? ganjilMonths : genapMonths;
      conditions.push(inArray(infaqBills.month, monthList));
    }

    // Filter Relasi Siswa
    if (search) conditions.push(ilike(students.name, `%${search}%`));
    if (classroomId) conditions.push(eq(studentEnrollments.classroomId, Number(classroomId)));
    if (gender) conditions.push(eq(students.gender, gender));

    const whereClause = and(...conditions);

    // 3. Ambil Stats Data Bills
    const [stats] = await db.select({
      totalBills: sql<number>`count(*)`.mapWith(Number),
      totalNominal: sql<number>`coalesce(sum(${infaqBills.nominal}), 0)`.mapWith(Number),
      lunasCount: sql<number>`count(case when ${infaqBills.status} = 'lunas' then 1 end)`.mapWith(Number),
      belumLunasCount: sql<number>`count(case when ${infaqBills.status} = 'belum_lunas' then 1 end)`.mapWith(Number),
      sebagianCount: sql<number>`count(case when ${infaqBills.status} = 'sebagian' then 1 end)`.mapWith(Number),
    })
    .from(infaqBills)
    .leftJoin(students, eq(infaqBills.studentId, students.id))
    .leftJoin(
      studentEnrollments,
      and(
        eq(studentEnrollments.studentId, infaqBills.studentId),
        eq(studentEnrollments.academicYearId, infaqBills.academicYearId),
        isNull(studentEnrollments.deletedAt)
      )
    )
    .where(whereClause);

    // 4. Ambil Stats Total Pembayaran Aktif
    const [paymentStats] = await db.select({
      totalPaid: sql<number>`coalesce(sum(${infaqPayments.amountPaid}), 0)`.mapWith(Number)
    })
    .from(infaqPayments)
    .innerJoin(infaqBills, eq(infaqPayments.billId, infaqBills.id))
    .leftJoin(students, eq(infaqBills.studentId, students.id))
    .leftJoin(
      studentEnrollments,
      and(
        eq(studentEnrollments.studentId, infaqBills.studentId),
        eq(studentEnrollments.academicYearId, infaqBills.academicYearId),
        isNull(studentEnrollments.deletedAt)
      )
    )
    .where(and(whereClause, isNull(infaqPayments.deletedAt)));

    const response = NextResponse.json({
      success: true,
      data: {
        totalBills: stats.totalBills || 0,
        totalNominal: stats.totalNominal || 0,
        totalPaid: paymentStats.totalPaid || 0,
        totalUnpaid: Math.max(0, (stats.totalNominal || 0) - (paymentStats.totalPaid || 0)),
        lunasCount: stats.lunasCount || 0,
        belumLunasCount: stats.belumLunasCount || 0,
        sebagianCount: stats.sebagianCount || 0,
        collectionRate: stats.totalNominal > 0 ? ((paymentStats.totalPaid || 0) / stats.totalNominal) * 100 : 0
      }
    });

    response.headers.set('Cache-Control', 'no-store');
    return response;

  } catch (error: unknown) {
    console.error("GET Infaq Bills Stats error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
