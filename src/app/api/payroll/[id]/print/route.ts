import { NextResponse } from "next/server";
import { db } from "@/db";
import { payrolls, employees, payrollDetails, salaryComponents } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

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

    const [payroll] = await db
      .select({
        id: payrolls.id,
        month: payrolls.month,
        year: payrolls.year,
        status: payrolls.status,
        createdAt: payrolls.createdAt,
        employee: {
          id: employees.id,
          name: employees.name,
          nip: employees.nip,
          position: employees.position,
        },
      })
      .from(payrolls)
      .leftJoin(employees, eq(payrolls.employeeId, employees.id))
      .where(and(eq(payrolls.id, payrollId), isNull(payrolls.deletedAt)))
      .limit(1);

    if (!payroll) {
      return NextResponse.json({ success: false, message: "Payroll tidak ditemukan" }, { status: 404 });
    }

    const details = await db
      .select({
        amount: payrollDetails.amount,
        componentName: payrollDetails.componentName,
        type: payrollDetails.type,
      })
      .from(payrollDetails)
      .where(and(eq(payrollDetails.payrollId, payrollId), isNull(payrollDetails.deletedAt)))
      .orderBy(payrollDetails.id);

    // Hitung earning & deduction
    let totalEarning = 0;
    let totalDeduction = 0;

    const items = details.map((d) => {
      const type = d.type || "earning";
      if (type === "earning") totalEarning += d.amount;
      else totalDeduction += d.amount;
      return {
        name: d.componentName || "-",
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
        employee: payroll.employee,
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
    console.error("Payroll Print error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat slip gaji" }, { status: 500 });
  }
}
