import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, classrooms, studentEnrollments, generalTransactions, infaqBills } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, gte, lte, asc, sql } from "drizzle-orm";

/**
 * GET /api/dashboard/charts — Data untuk charts dashboard dengan filter
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : null;

    // 1. Tentukan Tahun Ajaran Aktif jika tidak difilter
    let targetAcademicYearId = academicYearId;
    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    const now = new Date();
    const months: { label: string; start: Date; end: Date }[] = [];

    // Cashflow 6 bulan terakhir
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      months.push({ label, start: d, end });
    }

    // ⚡ Bolt: Optimize N+1 queries by fetching all valid transactions for the 6-month period
    // instead of running 12 separate queries (2 for each month).
    const startDate = months[0].start;
    const endDate = months[months.length - 1].end;

    const allTransactions = await db.select({
      type: generalTransactions.type,
      amount: generalTransactions.amount,
      createdAt: generalTransactions.createdAt,
    })
    .from(generalTransactions)
    .where(and(
      eq(generalTransactions.status, "valid" as any),
      isNull(generalTransactions.deletedAt),
      gte(generalTransactions.createdAt, startDate),
      lte(generalTransactions.createdAt, endDate)
    ));

    // Group transactions by month in-memory
    const cashflowData = months.map((m) => {
      let income = 0;
      let expense = 0;

      for (const tx of allTransactions) {
        if (tx.createdAt >= m.start && tx.createdAt <= m.end) {
          const amt = Number(tx.amount);
          if (tx.type === ("in" as any)) income += amt;
          else if (tx.type === ("out" as any)) expense += amt;
        }
      }

      return { month: m.label, income, expense };
    });

    // 2. Distribusi siswa per kelas
    const classroomConditions = [isNull(classrooms.deletedAt)];
    if (targetAcademicYearId) classroomConditions.push(eq(classrooms.academicYearId, targetAcademicYearId));

    const classDistribution = await db.select({
      name: classrooms.name,
      students: sql<number>`count(distinct ${studentEnrollments.id})`.mapWith(Number),
    })
    .from(classrooms)
    .leftJoin(studentEnrollments, and(
      eq(classrooms.id, studentEnrollments.classroomId),
      isNull(studentEnrollments.deletedAt)
    ))
    .where(and(...classroomConditions))
    .groupBy(classrooms.id, classrooms.name)
    .orderBy(asc(classrooms.name));

    // 3. SPP compliance
    const currentMonthStr = now.toLocaleDateString("id-ID", { month: "long" });
    const billBaseConditions = [isNull(infaqBills.deletedAt)];
    if (targetAcademicYearId) billBaseConditions.push(eq(infaqBills.academicYearId, targetAcademicYearId));

    const [[{ sppTotal }], [{ sppLunas }]] = await Promise.all([
      db.select({ sppTotal: sql<number>`count(*)`.mapWith(Number) })
        .from(infaqBills)
        .where(and(...billBaseConditions, eq(infaqBills.month, currentMonthStr))),
      db.select({ sppLunas: sql<number>`count(*)`.mapWith(Number) })
        .from(infaqBills)
        .where(and(...billBaseConditions, eq(infaqBills.month, currentMonthStr), eq(infaqBills.status, "lunas" as any))),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cashflow: cashflowData,
        classDistribution: classDistribution.map((c) => ({
          name: c.name,
          students: c.students,
        })),
        sppCompliance: {
          total: sppTotal,
          lunas: sppLunas,
          rate: sppTotal > 0 ? Math.round((sppLunas / sppTotal) * 100) : 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Dashboard charts error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data chart" }, { status: 500 });
  }
}
