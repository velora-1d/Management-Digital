import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, studentEnrollments, employees, classrooms, infaqBills, ppdbRegistrations, generalTransactions, studentSavings, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, ilike, gte, lte, sql } from "drizzle-orm";

/**
 * GET /api/dashboard/summary — Semua data dashboard KPI dengan filter
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

    // 1. Tentukan Tahun Ajaran Aktif jika tidak difilter
    let targetAcademicYearId = academicYearId;
    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    // 2. Siapkan Rentang Waktu (Bulan/Semester) untuk Transaksi Keuangan
    const now = new Date();
    let dateStart: Date;
    let dateEnd: Date;

    if (month) {
      const monthMap: Record<string, number> = {
        "Januari": 0, "Februari": 1, "Maret": 2, "April": 3, "Mei": 4, "Juni": 5,
        "Juli": 6, "Agustus": 7, "September": 8, "Oktober": 9, "November": 10, "Desember": 11
      };
      const mIdx = monthMap[month] ?? now.getMonth();
      dateStart = new Date(now.getFullYear(), mIdx, 1);
      dateEnd = new Date(now.getFullYear(), mIdx + 1, 0, 23, 59, 59);
    } else if (semester) {
      const isGanjil = semester.toLowerCase() === "ganjil";
      dateStart = new Date(now.getFullYear(), isGanjil ? 6 : 0, 1);
      dateEnd = new Date(now.getFullYear(), isGanjil ? 11 : 5, 31, 23, 59, 59);
    } else {
      dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // 3. Build conditions
    const enrollmentConditions = [isNull(studentEnrollments.deletedAt)];
    if (targetAcademicYearId) enrollmentConditions.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
    if (classroomId) enrollmentConditions.push(eq(studentEnrollments.classroomId, classroomId));

    const billConditions = [eq(infaqBills.status, "belum_lunas" as any), isNull(infaqBills.deletedAt)];
    if (targetAcademicYearId) billConditions.push(eq(infaqBills.academicYearId, targetAcademicYearId));
    if (month) billConditions.push(eq(infaqBills.month, month));

    const classroomConditions = [isNull(classrooms.deletedAt)];
    if (targetAcademicYearId) classroomConditions.push(eq(classrooms.academicYearId, targetAcademicYearId));

    // Hitung paralel
    const [
      [{ siswaTerdaftar }],
      [{ totalGuru }],
      [{ totalStaff }],
      [{ totalKelas }],
      [{ tunggakanCount }],
      [{ tunggakanSum }],
      ppdbStats,
      [{ pemasukanPeriode }],
      [{ pengeluaranPeriode }],
      [{ totalSaldoTabungan }],
      [{ totalSaldoKas }],
    ] = await Promise.all([
      db.select({ siswaTerdaftar: sql<number>`count(*)`.mapWith(Number) })
        .from(studentEnrollments)
        .where(and(...enrollmentConditions)),

      db.select({ totalGuru: sql<number>`count(*)`.mapWith(Number) })
        .from(employees)
        .where(and(isNull(employees.deletedAt), ilike(employees.position, "%guru%"), eq(employees.status, "aktif" as any))),

      db.select({ totalStaff: sql<number>`count(*)`.mapWith(Number) })
        .from(employees)
        .where(and(isNull(employees.deletedAt), eq(employees.status, "aktif" as any))),

      db.select({ totalKelas: sql<number>`count(*)`.mapWith(Number) })
        .from(classrooms)
        .where(and(...classroomConditions)),

      db.select({ tunggakanCount: sql<number>`count(*)`.mapWith(Number) })
        .from(infaqBills)
        .where(and(...billConditions)),

      db.select({ tunggakanSum: sql<number>`coalesce(sum(${infaqBills.nominal}), 0)`.mapWith(Number) })
        .from(infaqBills)
        .where(and(...billConditions)),

      db.select({
        status: ppdbRegistrations.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(ppdbRegistrations)
      .where(isNull(ppdbRegistrations.deletedAt))
      .groupBy(ppdbRegistrations.status),

      db.select({ pemasukanPeriode: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions)
        .where(and(eq(generalTransactions.type, "in" as any), eq(generalTransactions.status, "valid" as any), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, dateStart), lte(generalTransactions.createdAt, dateEnd))),

      db.select({ pengeluaranPeriode: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number) })
        .from(generalTransactions)
        .where(and(eq(generalTransactions.type, "out" as any), eq(generalTransactions.status, "valid" as any), isNull(generalTransactions.deletedAt), gte(generalTransactions.createdAt, dateStart), lte(generalTransactions.createdAt, dateEnd))),

      db.select({ totalSaldoTabungan: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
        .from(studentSavings)
        .where(isNull(studentSavings.deletedAt)),

      db.select({ totalSaldoKas: sql<number>`coalesce(sum(${cashAccounts.balance}), 0)`.mapWith(Number) })
        .from(cashAccounts)
        .where(isNull(cashAccounts.deletedAt)),
    ]);

    const ppdbMap: Record<string, number> = {};
    ppdbStats.forEach((p: any) => { ppdbMap[p.status] = p.count; });

    return NextResponse.json({
      success: true,
      data: {
        siswaAktif: siswaTerdaftar,
        totalGuru,
        totalStaff,
        totalKelas,
        tunggakan: { count: tunggakanCount, total: tunggakanSum },
        ppdb: {
          total: Object.values(ppdbMap).reduce((s, c) => s + c, 0),
          menunggu: (ppdbMap["menunggu"] || 0) + (ppdbMap["pending"] || 0),
          diterima: ppdbMap["diterima"] || 0,
          ditolak: ppdbMap["ditolak"] || 0,
          converted: ppdbMap["converted"] || 0,
        },
        pemasukanPeriode,
        pengeluaranPeriode,
        totalSaldoTabungan,
        totalSaldoKas,
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
