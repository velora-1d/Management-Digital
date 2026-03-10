import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payroll/[id]
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const payrollId = parseInt(params.id);
    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: { select: { id: true, name: true } },
        details: { where: { deletedAt: null }, orderBy: { id: "asc" } },
      },
    });

    if (!payroll) {
      return NextResponse.json({ error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: payroll.id,
      code: `PAY-${payroll.year}${payroll.month.padStart(2, '0')}-${payroll.id.toString().padStart(4, '0')}`,
      employee_name: payroll.employee?.name || "Unknown",
      month: payroll.month,
      year: payroll.year,
      base_salary: payroll.baseSalary,
      total_earning: payroll.baseSalary + payroll.totalAllowance,
      total_deduction: payroll.totalDeduction,
      net_salary: payroll.netSalary,
      status: payroll.status,
      created_at: payroll.createdAt,
      components: payroll.details.map(c => ({
        id: c.componentId,
        name: c.componentName,
        type: c.type,
        amount: c.amount,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data slip gaji" }, { status: 500 });
  }
}

// PUT /api/payroll/[id] — Edit komponen slip gaji (hanya draft)
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const payrollId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
    if (!payroll) {
      return NextResponse.json({ error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    if (payroll.status !== "draft") {
      return NextResponse.json({ error: "Hanya slip berstatus draft yang bisa diedit" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Hapus detail lama
      await tx.payrollDetail.deleteMany({ where: { payrollId: payrollId } });

      let totalEarning = 0;
      let totalDeduction = 0;
      let baseSalary = 0;
      const detailsData: any[] = [];

      for (const item of body) {
        const amount = Number(item.amount) || 0;
        if (amount > 0) {
          const type = item.type || "earning";
          const compId = item.component_id === "base" ? null : Number(item.component_id);

          detailsData.push({
            payrollId: payrollId,
            componentId: compId,
            componentName: item.name || "Unknown",
            type: type,
            amount: amount,
          });

          if (item.component_id === "base") {
            baseSalary = amount;
            totalEarning += amount;
          } else if (type === "earning") {
            totalEarning += amount;
          } else {
            totalDeduction += amount;
          }
        }
      }

      if (detailsData.length > 0) {
        await tx.payrollDetail.createMany({ data: detailsData });
      }

      await tx.payroll.update({
        where: { id: payrollId },
        data: {
          baseSalary,
          totalAllowance: totalEarning - baseSalary,
          totalDeduction,
          netSalary: totalEarning - totalDeduction,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Slip gaji diperbarui" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan detail slip gaji" }, { status: 500 });
  }
}

// DELETE /api/payroll/[id] — Hapus slip gaji (hanya draft)
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const payrollId = parseInt(params.id);
    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const payroll = await prisma.payroll.findUnique({ where: { id: payrollId } });
    if (!payroll) {
      return NextResponse.json({ error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    if (payroll.status !== "draft") {
      return NextResponse.json({ error: "Hanya slip berstatus draft yang bisa dihapus" }, { status: 400 });
    }

    await prisma.payroll.update({
      where: { id: payrollId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Slip gaji dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus slip gaji" }, { status: 500 });
  }
}
