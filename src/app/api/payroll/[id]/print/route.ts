import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/payroll/[id]/print — Data slip gaji untuk print view
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const payrollId = Number(params.id);

    if (isNaN(payrollId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: true,
        details: {
          include: { component: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!payroll || payroll.deletedAt) {
      return NextResponse.json({ success: false, message: "Payroll tidak ditemukan" }, { status: 404 });
    }

    // Hitung earning & deduction
    let totalEarning = 0;
    let totalDeduction = 0;

    const items = payroll.details.map((d: any) => {
      const type = d.component?.type || "earning";
      if (type === "earning") totalEarning += d.amount;
      else totalDeduction += d.amount;
      return {
        name: d.component?.name || "-",
        type,
        amount: d.amount,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: payroll.id,
        period: `${payroll.month} ${payroll.year}`,
        status: payroll.status,
        employee: {
          id: payroll.employee?.id,
          name: payroll.employee?.name || "-",
          nip: payroll.employee?.nip || "-",
          position: payroll.employee?.position || "-",
        },
        items,
        totalEarning,
        totalDeduction,
        netSalary: totalEarning - totalDeduction,
        createdAt: payroll.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat slip gaji" }, { status: 500 });
  }
}
