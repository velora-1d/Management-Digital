import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, classrooms, studentEnrollments, generalTransactions, infaqBills, students } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, gte, lte, asc, sql, inArray } from "drizzle-orm";

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

    // Cashflow per bulan
    let cashflowData = months.map(m => ({ month: m.label, income: 0, expense: 0 }));

    if (months.length > 0) {
      // months is ordered from oldest to newest in the original loop
      const startDate = months[0].start; // The earliest month
      const endDate = months[months.length - 1].end; // The latest month

      const rawCashflow = await db.select({
        type: generalTransactions.type,
        amount: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number),
        month: sql<number>`extract(month from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`.mapWith(Number),
        year: sql<number>`extract(year from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`.mapWith(Number),
      })
      .from(generalTransactions)
      .where(and(
        inArray(generalTransactions.type, ["in", "out"]),
        eq(generalTransactions.status, "valid"),
        isNull(generalTransactions.deletedAt),
        gte(generalTransactions.createdAt, startDate),
        lte(generalTransactions.createdAt, endDate)
      ))
      .groupBy(
        generalTransactions.type,
        sql`extract(month from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`,
        sql`extract(year from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`
      );

      const cashflowMap = new Map<string, { income: number, expense: number }>();

      for (const row of rawCashflow) {
        // Construct a string key to match the formatted month label
        // We use the 15th of the month at noon to avoid timezone shift issues
        const d = new Date(row.year, row.month - 1, 15, 12, 0, 0);
        const label = new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "Asia/Jakarta" }).format(d);

        if (!cashflowMap.has(label)) {
          cashflowMap.set(label, { income: 0, expense: 0 });
        }

        const current = cashflowMap.get(label)!;
        if (row.type === "in") {
          current.income += row.amount;
        } else if (row.type === "out") {
          current.expense += row.amount;
        }
      }

      cashflowData = cashflowData.map(c => {
        const aggregated = cashflowMap.get(c.month);
        if (aggregated) {
          return { month: c.month, income: aggregated.income, expense: aggregated.expense };
        }
        return c;
      });
    }

    // 2. Distribusi siswa per kelas
    const classroomConditions = [isNull(classrooms.deletedAt)];
    if (targetAcademicYearId) classroomConditions.push(eq(classrooms.academicYearId, targetAcademicYearId));

    const classDistribution = await db.select({
      name: classrooms.name,
      students: sql<number>`count(distinct ${students.id})`.mapWith(Number),
    })
    .from(classrooms)
    .leftJoin(studentEnrollments, and(
      eq(classrooms.id, studentEnrollments.classroomId),
      targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
      isNull(studentEnrollments.deletedAt)
    ))
    .leftJoin(students, and(
      eq(studentEnrollments.studentId, students.id),
      isNull(students.deletedAt),
      eq(students.status, "aktif")
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
        .where(and(...billBaseConditions, eq(infaqBills.month, currentMonthStr), eq(infaqBills.status, "lunas"))),
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
