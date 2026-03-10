import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/dashboard/charts — Data untuk charts dashboard dengan filter
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    const academicYearId = searchParams.get("academicYearId") ? Number(searchParams.get("academicYearId")) : null;
    const classroomId = searchParams.get("classroomId") ? Number(searchParams.get("classroomId")) : null;
    const gender = searchParams.get("gender");

    // 1. Tentukan Tahun Ajaran Aktif jika tidak difilter
    let targetAcademicYearId = academicYearId;
    if (!targetAcademicYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { isActive: true, deletedAt: null },
      });
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

    // Cashflow per bulan (Transaksi umum biasanya lintas tahun, tapi kita filter status & deletedAt)
    const cashflowData = await Promise.all(
      months.map(async (m) => {
        const [incomeAgg, expenseAgg] = await Promise.all([
          prisma.generalTransaction.aggregate({
            where: { type: "in", status: "valid", deletedAt: null, createdAt: { gte: m.start, lte: m.end } },
            _sum: { amount: true },
          }),
          prisma.generalTransaction.aggregate({
            where: { type: "out", status: "valid", deletedAt: null, createdAt: { gte: m.start, lte: m.end } },
            _sum: { amount: true },
          }),
        ]);
        return {
          month: m.label,
          income: incomeAgg._sum.amount || 0,
          expense: expenseAgg._sum.amount || 0,
        };
      })
    );

    // 2. Distribusi siswa per kelas (Hanya untuk Tahun Ajaran terpilih)
    const classDistribution = await prisma.classroom.findMany({
      where: { 
        deletedAt: null,
        ...(targetAcademicYearId ? { academicYearId: targetAcademicYearId } : {})
      },
      select: {
        name: true,
        _count: { 
          select: { 
            studentEnrollments: {
              where: {
                deletedAt: null,
                ...(gender ? { student: { gender } } : {})
              }
            }
          } 
        },
      },
      orderBy: { name: "asc" },
    });

    // 3. SPP compliance (Berdasarkan Tahun Ajaran terpilih)
    const billWhere: any = { deletedAt: null };
    if (targetAcademicYearId) billWhere.academicYearId = targetAcademicYearId;
    if (classroomId) billWhere.student = { classroomId };
    if (gender) billWhere.student = { ...billWhere.student, gender };

    // Kita ambil kepatuhan untuk bulan berjalan (jika ada tagihannya)
    const currentMonthStr = now.toLocaleDateString("id-ID", { month: "long" });
    const [sppTotal, sppLunas] = await Promise.all([
      prisma.infaqBill.count({ 
        where: { ...billWhere, month: currentMonthStr } 
      }),
      prisma.infaqBill.count({ 
        where: { ...billWhere, month: currentMonthStr, status: "lunas" } 
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cashflow: cashflowData,
        classDistribution: classDistribution.map((c) => ({
          name: c.name,
          students: c._count.studentEnrollments,
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
