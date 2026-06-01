import { NextResponse } from "next/server";
import { db } from "@/db";
import { payrolls, employees, payrollDetails, generalTransactions, cashAccounts } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

type PayrollDetailInsert = typeof payrollDetails.$inferInsert;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

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

    const [payroll] = await db
      .select({
        id: payrolls.id,
        month: payrolls.month,
        year: payrolls.year,
        baseSalary: payrolls.baseSalary,
        totalAllowance: payrolls.totalAllowance,
        totalDeduction: payrolls.totalDeduction,
        netSalary: payrolls.netSalary,
        status: payrolls.status,
        createdAt: payrolls.createdAt,
        employeeName: employees.name,
        employeeId: employees.id,
      })
      .from(payrolls)
      .leftJoin(employees, eq(payrolls.employeeId, employees.id))
      .where(eq(payrolls.id, payrollId))
      .limit(1);

    if (!payroll) {
      return NextResponse.json({ error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    const details = await db
      .select()
      .from(payrollDetails)
      .where(and(eq(payrollDetails.payrollId, payrollId), isNull(payrollDetails.deletedAt)))
      .orderBy(payrollDetails.id);

    return NextResponse.json({
      id: payroll.id,
      code: `PAY-${payroll.year}${payroll.month.padStart(2, '0')}-${payroll.id.toString().padStart(4, '0')}`,
      employee_name: payroll.employeeName || "Unknown",
      month: payroll.month,
      year: payroll.year,
      base_salary: payroll.baseSalary,
      total_earning: payroll.baseSalary + payroll.totalAllowance,
      total_deduction: payroll.totalDeduction,
      net_salary: payroll.netSalary,
      status: payroll.status,
      created_at: payroll.createdAt,
      components: details.map(c => ({
        id: c.componentId,
        name: c.componentName,
        type: c.type,
        amount: c.amount,
      })),
    });
  } catch (error) {
    console.error("Payroll [id] GET error:", error);
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

    const [payroll] = await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.id, payrollId))
      .limit(1);

    if (!payroll) {
      return NextResponse.json({ error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    if (payroll.status !== "draft") {
      return NextResponse.json({ error: "Hanya slip berstatus draft yang bisa diedit" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      // Hapus detail lama (hard delete detail)
      await tx.delete(payrollDetails).where(eq(payrollDetails.payrollId, payrollId));

      let totalEarning = 0;
      let totalDeduction = 0;
      let baseSalary = 0;
      const detailsData: PayrollDetailInsert[] = [];

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
        await tx.insert(payrollDetails).values(detailsData);
      }

      await tx
        .update(payrolls)
        .set({
          baseSalary,
          totalAllowance: totalEarning - baseSalary,
          totalDeduction,
          netSalary: totalEarning - totalDeduction,
          updatedAt: new Date(),
        })
        .where(eq(payrolls.id, payrollId));
    });

    return NextResponse.json({ success: true, message: "Slip gaji diperbarui" });
  } catch (error) {
    console.error("Payroll [id] PUT error:", error);
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

    const [payroll] = await db
      .select()
      .from(payrolls)
      .where(eq(payrolls.id, payrollId))
      .limit(1);

    if (!payroll) {
      return NextResponse.json({ error: "Slip gaji tidak ditemukan" }, { status: 404 });
    }

    if (payroll.status !== "draft") {
      return NextResponse.json({ error: "Hanya slip berstatus draft yang bisa dihapus" }, { status: 400 });
    }

    await db
      .update(payrolls)
      .set({ deletedAt: new Date() })
      .where(eq(payrolls.id, payrollId));

    return NextResponse.json({ success: true, message: "Slip gaji dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus slip gaji" }, { status: 500 });
  }
}

// PATCH /api/payroll/[id] — Finalisasi & Bayar (pindah status ke paid + catat jurnal)
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const user = await requireAuth();
    const payrollId = parseInt(params.id);
    const body = await request.json();
    const { cashAccountId, transactionCategoryId, notes } = body;

    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    if (!cashAccountId) {
      return NextResponse.json({ error: "Akun Kas wajib dipilih untuk pembayaran" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // 1. Ambil data payroll
      const [payroll] = await tx
        .select()
        .from(payrolls)
        .where(and(eq(payrolls.id, payrollId), isNull(payrolls.deletedAt)))
        .limit(1);

      if (!payroll) throw new Error("Slip gaji tidak ditemukan");
      if (payroll.status === "paid") throw new Error("Slip gaji sudah dibayar");

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];

      // 2. Insert ke General Transactions (Jurnal Umum)
      await tx.insert(generalTransactions).values({
        type: "out",
        amount: payroll.netSalary,
        cashAccountId: Number(cashAccountId),
        transactionCategoryId: transactionCategoryId ? Number(transactionCategoryId) : null,
        description: `Pembayaran Gaji - #${payroll.id} - ${payroll.month}/${payroll.year} ${notes ? `- ${notes}` : ""}`,
        transactionDate: dateStr,
        status: "valid",
        referenceType: "payroll",
        referenceId: String(payroll.id),
        userId: user.userId,
        unitId: payroll.unitId || user.unitId || "",
      });

      // 3. Update Saldo Kas
      await tx.update(cashAccounts)
        .set({ balance: sql`${cashAccounts.balance} - ${payroll.netSalary}` })
        .where(eq(cashAccounts.id, Number(cashAccountId)));

      // 4. Update Status Payroll
      const [updated] = await tx
        .update(payrolls)
        .set({
          status: "paid",
          paidAt: dateStr,
          updatedAt: now,
        })
        .where(eq(payrolls.id, payrollId))
        .returning();

      return updated;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Payroll [id] PATCH error:", error);
    return NextResponse.json({ error: getErrorMessage(error, "Gagal memproses pembayaran gaji") }, { status: 500 });
  }
}
