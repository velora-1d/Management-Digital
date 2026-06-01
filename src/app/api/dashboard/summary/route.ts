import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, studentEnrollments, employees, classrooms, infaqBills, ppdbRegistrations, generalTransactions, studentSavings, students, transactionCategories } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, ilike, gte, lte, sql, inArray, isNotNull, or } from "drizzle-orm";

/**
 * GET /api/dashboard/summary — Semua data dashboard KPI dengan filter sinkron dengan Page Utama
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : null;
    const semester = searchParams.get("semester");
    const month = searchParams.get("month");
    const classroomId = searchParams.get("classroomId") ? Number(searchParams.get("classroomId")) : null;
    const gender = searchParams.get("gender");

    // 1. Tentukan Tahun Ajaran Target & Detailnya
    let targetAcademicYearId = academicYearId;
    const activeYearRes = await db.select()
      .from(academicYears)
      .where(and(
        targetAcademicYearId ? eq(academicYears.id, targetAcademicYearId) : eq(academicYears.isActive, true),
        isNull(academicYears.deletedAt)
      ))
      .limit(1);
    
    const activeYearData = activeYearRes[0];
    targetAcademicYearId = activeYearData?.id || null;
    const yearLabel = activeYearData?.year || ""; // Misal "2025/2026"
    const yearParts = yearLabel.split('/');
    const now = new Date();
    const startYear = yearParts[0] ? Number(yearParts[0]) : now.getFullYear();
    const endYear = yearParts[1] ? Number(yearParts[1]) : startYear + 1;

    // 2. Logika Rentang Waktu
    const monthMap: Record<string, number> = {
      "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, "Mei": 4, "Juni": 5,
      "Juli": 6, "Agustus": 7, "September": 8, "Oktober": 9, "November": 10, "Desember": 11
    };

    const getYearForMonth = (mIdx: number) => (mIdx >= 0 && mIdx <= 5) ? endYear : startYear;

    // Range Bulan Berjalan
    const thisMonthIdx = now.getMonth();
    const thisMonthYear = getYearForMonth(thisMonthIdx);
    const thisMonthStart = new Date(thisMonthYear, thisMonthIdx, 1);
    const thisMonthEnd = new Date(thisMonthYear, thisMonthIdx + 1, 0, 23, 59, 59);

    // Range Periode
    let dateStart: Date, dateEnd: Date;
    if (month) {
      const mIdx = monthMap[month] ?? now.getMonth();
      const mYear = getYearForMonth(mIdx);
      dateStart = new Date(mYear, mIdx, 1);
      dateEnd = new Date(mYear, mIdx + 1, 0, 23, 59, 59);
    } else if (semester) {
      const isGanjil = semester.toLowerCase() === "ganjil";
      dateStart = new Date(startYear, isGanjil ? 6 : 0, 1);
      dateEnd = new Date(isGanjil ? startYear : endYear, isGanjil ? 12 : 6, 0, 23, 59, 59);
    } else {
      dateStart = new Date(startYear, 6, 1);
      dateEnd = new Date(endYear, 6, 0, 23, 59, 59);
    }

    // 3. Build conditions
    const enrollmentConds = [isNull(studentEnrollments.deletedAt), isNull(students.deletedAt), eq(students.status, "aktif")];
    if (targetAcademicYearId) enrollmentConds.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
    if (classroomId) enrollmentConds.push(eq(studentEnrollments.classroomId, classroomId));
    if (gender) enrollmentConds.push(eq(students.gender, gender));

    const billConds = [eq(infaqBills.status, "belum_lunas"), isNull(infaqBills.deletedAt)];
    if (targetAcademicYearId) billConds.push(eq(infaqBills.academicYearId, targetAcademicYearId));
    if (month) billConds.push(eq(infaqBills.month, month));
    if (semester) {
      const ganjilMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const genapMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      billConds.push(inArray(infaqBills.month, semester.toLowerCase() === "ganjil" ? ganjilMonths : genapMonths));
    }

    // Hitung paralel
    const [
      [resSiswa],
      employeesGroup,
      [resKelas],
      [resTunggakan],
      ppdbStats,
      [resIncomePeriode], [resExpensePeriode],
      [resIncomeMonth], [resExpenseMonth],
      [resTabungan],
      [resWakaf],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(distinct ${students.id})`.mapWith(Number) })
        .from(studentEnrollments)
        .innerJoin(students, eq(studentEnrollments.studentId, students.id))
        .where(and(...enrollmentConds)),
      
      db.select({ type: employees.type, count: sql<number>`count(*)`.mapWith(Number) })
        .from(employees)
        .where(and(isNull(employees.deletedAt), eq(employees.status, "aktif")))
        .groupBy(employees.type),

      db.select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(classrooms)
        .where(and(isNull(classrooms.deletedAt), targetAcademicYearId ? eq(classrooms.academicYearId, targetAcademicYearId) : undefined)),

      db.select({ 
        count: sql<number>`count(*)`.mapWith(Number), 
        total: sql<number>`coalesce(sum(${infaqBills.nominal}), 0)`.mapWith(Number) 
      }).from(infaqBills).where(and(...billConds)),

      db.select({ status: ppdbRegistrations.status, count: sql<number>`count(*)`.mapWith(Number) })
        .from(ppdbRegistrations)
        .where(and(isNull(ppdbRegistrations.deletedAt), gender ? eq(ppdbRegistrations.gender, gender) : undefined))
        .groupBy(ppdbRegistrations.status),

      db.select({ sum: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) }).from(generalTransactions).where(and(eq(generalTransactions.type, "in"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, dateStart), lte(generalTransactions.createdAt, dateEnd))),
      db.select({ sum: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) }).from(generalTransactions).where(and(eq(generalTransactions.type, "out"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, dateStart), lte(generalTransactions.createdAt, dateEnd))),

      db.select({ sum: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) }).from(generalTransactions).where(and(eq(generalTransactions.type, "in"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, thisMonthStart), lte(generalTransactions.createdAt, thisMonthEnd))),
      db.select({ sum: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) }).from(generalTransactions).where(and(eq(generalTransactions.type, "out"), eq(generalTransactions.status, "valid"), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, thisMonthStart), lte(generalTransactions.createdAt, thisMonthEnd))),

      db.select({ sum: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) }).from(studentSavings).where(isNull(studentSavings.deletedAt)),
      
      db.select({ sum: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions)
        .leftJoin(transactionCategories, eq(generalTransactions.transactionCategoryId, transactionCategories.id))
        .where(and(
          eq(generalTransactions.type, "in"),
          eq(generalTransactions.status, "valid"),
          isNull(generalTransactions.deletedAt),
          or(
            isNotNull(generalTransactions.wakafDonorId),
            isNotNull(generalTransactions.wakafPurposeId),
            ilike(transactionCategories.name, "%wakaf%"),
            ilike(transactionCategories.name, "%waqaf%"),
            ilike(generalTransactions.description, "%wakaf%"),
            ilike(generalTransactions.description, "%waqaf%")
          )
        )),
    ]);

    const ppdbMap: Record<string, number> = {};
    ppdbStats.forEach((p) => { ppdbMap[p.status] = p.count; });

    return NextResponse.json({
      success: true,
      data: {
        siswaAktif: resSiswa.count,
        totalGuru: employeesGroup.find(e => e.type === "guru")?.count || 0,
        totalStaff: employeesGroup.find(e => e.type === "staf")?.count || 0,
        totalKelas: resKelas.count,
        tunggakan: { 
          count: resTunggakan.count, 
          total: resTunggakan.total 
        },
        ppdb: {
          total: Object.values(ppdbMap).reduce((s, c) => s + c, 0),
          menunggu: (ppdbMap["menunggu"] || 0) + (ppdbMap["pending"] || 0),
          diterima: ppdbMap["diterima"] || 0,
        },
        pemasukanPeriode: resIncomePeriode.sum,
        pengeluaranPeriode: resExpensePeriode.sum,
        pemasukanBulanIni: resIncomeMonth.sum,
        pengeluaranBulanIni: resExpenseMonth.sum,
        totalSaldoTabungan: resTabungan.sum,
        totalWakaf: resWakaf.sum,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Dashboard summary error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat dashboard" }, { status: 500 });
  }
}
