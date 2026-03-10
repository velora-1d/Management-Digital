import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payroll/employees/[id]/salary
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const components = await prisma.salaryComponent.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" },
    });

    const employeeSalaries = await prisma.employeeSalary.findMany({
      where: { employeeId: employeeId, deletedAt: null },
    });

    const result = components.map(c => {
      const existing = employeeSalaries.find(es => es.componentId === c.id);
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        amount: existing ? existing.amount : c.defaultAmount,
      };
    });

    return NextResponse.json({ components: result });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil detail gaji pegawai" }, { status: 500 });
  }
}

// PUT /api/payroll/employees/[id]/salary
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();

    await prisma.$transaction(async (tx) => {
      await tx.employeeSalary.deleteMany({ where: { employeeId: employeeId } });

      const dataToInsert = body.map((item: any) => ({
        employeeId: employeeId,
        componentId: Number(item.component_id),
        amount: Number(item.amount) || 0,
      }));

      if (dataToInsert.length > 0) {
        await tx.employeeSalary.createMany({ data: dataToInsert });
      }
    });

    return NextResponse.json({ success: true, message: "Gaji diperbarui" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menyimpan detail gaji" }, { status: 500 });
  }
}
