import { NextResponse } from "next/server";
import { db } from "@/db";
import { salaryComponents, employeeSalaries } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";

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

    const componentsList = await db
      .select()
      .from(salaryComponents)
      .where(isNull(salaryComponents.deletedAt))
      .orderBy(asc(salaryComponents.id));

    const empSalariesList = await db
      .select()
      .from(employeeSalaries)
      .where(and(eq(employeeSalaries.employeeId, employeeId), isNull(employeeSalaries.deletedAt)));

    const result = componentsList.map(c => {
      const existing = empSalariesList.find(es => es.componentId === c.id);
      return {
        id: c.id,
        name: c.name,
        type: c.type,
        amount: existing ? existing.amount : c.defaultAmount,
      };
    });

    return NextResponse.json({ components: result });
  } catch (error) {
    console.error("Employee Salary GET error:", error);
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

    await db.transaction(async (tx) => {
      // Hard delete employee salaries for this employee
      await tx.delete(employeeSalaries).where(eq(employeeSalaries.employeeId, employeeId));

      const dataToInsert = body.map((item: any) => ({
        employeeId: employeeId,
        componentId: Number(item.component_id),
        amount: Number(item.amount) || 0,
      }));

      if (dataToInsert.length > 0) {
        await tx.insert(employeeSalaries).values(dataToInsert);
      }
    });

    return NextResponse.json({ success: true, message: "Gaji diperbarui" });
  } catch (error) {
    console.error("Employee Salary PUT error:", error);
    return NextResponse.json({ error: "Gagal menyimpan detail gaji" }, { status: 500 });
  }
}
