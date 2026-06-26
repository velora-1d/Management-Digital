import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, classrooms, studentEnrollments, generalTransactions, infaqBills, students } from "@/db/schema";
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

    // Cashflow per bulan
    // ⚡ Bolt: Replaced N+1 query loops with a single aggregated query for all 6 months
    const minStart = months.length > 0 ? months[0].start : new Date(); // Oldest month start is at index 0 because loop builds it from i=5 down to i=0
    const maxEnd = months.length > 0 ? months[months.length - 1].end : new Date(); // Current month end is at last index

    const aggregatedCashflow = await db.select({
      year: sql<number>`extract(year from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`.mapWith(Number),
      month: sql<number>`extract(month from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`.mapWith(Number),
      type: generalTransactions.type,
      total: sql<number>`coalesce(sum(${generalTransactions.amount}), 0)`.mapWith(Number),
    })
    .from(generalTransactions)
    .where(and(
      eq(generalTransactions.status, "valid"),
      isNull(generalTransactions.deletedAt),
      gte(generalTransactions.createdAt, minStart),
      lte(generalTransactions.createdAt, maxEnd)
    ))
    .groupBy(
      sql`extract(year from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`,
      sql`extract(month from ${generalTransactions.createdAt} AT TIME ZONE 'Asia/Jakarta')`,
      generalTransactions.type
    );

    const cashflowMap = new Map<string, { income: number; expense: number }>();
    for (const record of aggregatedCashflow) {
      const key = `${record.year}-${record.month}`;
      const entry = cashflowMap.get(key) || { income: 0, expense: 0 };
      if (record.type === "in") entry.income += record.total;
      if (record.type === "out") entry.expense += record.total;
      cashflowMap.set(key, entry);
    }

    // Helper for matching JS local time with PostgreSQL's Asia/Jakarta time
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "numeric",
    });

    const cashflowData = months.map(m => {
      // Month in JS is 0-indexed, PostgreSQL extract month is 1-indexed (1-12)
      // Extract exact year and month from the formatted Asia/Jakarta timezone
      const parts = dateFormatter.formatToParts(m.start);
      const yearStr = parts.find((p) => p.type === "year")?.value;
      const monthStr = parts.find((p) => p.type === "month")?.value;

      const key = `${yearStr}-${monthStr}`;
      const data = cashflowMap.get(key) || { income: 0, expense: 0 };
      return { month: m.label, income: data.income, expense: data.expense };
    });

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
