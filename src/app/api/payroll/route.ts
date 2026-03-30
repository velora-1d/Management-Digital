import { NextResponse } from "next/server";
import { db } from "@/db";
import { payrolls, employees, salaryComponents, employeeSalaries, payrollDetails } from "@/db/schema";
import { eq, and, isNull, desc, sql, inArray } from "drizzle-orm";

// GET /api/payroll
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    let whereClause = isNull(payrolls.deletedAt);
    if (month) whereClause = and(whereClause, eq(payrolls.month, month)) as any;
    if (year) whereClause = and(whereClause, eq(payrolls.year, year)) as any;

    const [results, totalResult] = await Promise.all([
      db
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
        })
        .from(payrolls)
        .leftJoin(employees, eq(payrolls.employeeId, employees.id))
        .where(whereClause)
        .orderBy(desc(payrolls.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(payrolls)
        .where(whereClause)
    ]);

    const total = totalResult[0]?.count || 0;

    const data = results.map((p) => ({
      id: p.id,
      code: `PAY-${p.year}${p.month.padStart(2, '0')}-${p.id.toString().padStart(4, '0')}`,
      employee_name: p.employeeName || "Unknown",
      total_earning: p.baseSalary + p.totalAllowance,
      total_deduction: p.totalDeduction,
      net_salary: p.netSalary,
      status: p.status,
      created_at: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Payroll GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data histori penggajian" },
      { status: 500 }
    );
  }
}

// POST /api/payroll — Generate slip gaji bulanan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const month = String(body.month || new Date().getMonth() + 1);
    const year = String(body.year || new Date().getFullYear());

    // 1. Ambil semua pegawai aktif
    const activeEmployees = await db
      .select()
      .from(employees)
      .where(and(eq(employees.status, "aktif"), isNull(employees.deletedAt)));

    if (activeEmployees.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada pegawai aktif untuk digenerate" },
        { status: 400 }
      );
    }

    // 2. Ambil semua komponen gaji dan setup gaji pegawai
    const allComponents = await db
      .select()
      .from(salaryComponents)
      .where(isNull(salaryComponents.deletedAt));

    const allEmployeeSalaries = await db
      .select()
      .from(employeeSalaries)
      .where(isNull(employeeSalaries.deletedAt));

    // 3. Ambil data payroll yang sudah ada bulan ini untuk mencegah query N+1
    const activeEmployeeIds = activeEmployees.map(e => e.id);
    const existingPayrolls = activeEmployeeIds.length > 0 ? await db
      .select({ employeeId: payrolls.employeeId })
      .from(payrolls)
      .where(
        and(
          inArray(payrolls.employeeId, activeEmployeeIds),
          eq(payrolls.month, month),
          eq(payrolls.year, year),
          isNull(payrolls.deletedAt)
        )
      ) : [];

    const existingEmployeeIds = new Set(existingPayrolls.map(p => p.employeeId));

    // 4. Generate slip gaji per pegawai dalam transaction
    await db.transaction(async (tx) => {
      for (const emp of activeEmployees) {
        // Cek apakah sudah digenerate bulan ini (O(1) lookup)
        if (existingEmployeeIds.has(emp.id)) continue;

        // Hitung gaji
        let totalEarning = emp.baseSalary || 0;
        let totalDeduction = 0;
        const detailsData: any[] = [];

        // Masukkan base salary sebagai komponen detail jika > 0
        if (emp.baseSalary > 0) {
          detailsData.push({
            componentId: null,
            componentName: "Gaji Pokok",
            type: "earning",
            amount: emp.baseSalary,
          });
        }

        // Ambil komponen spesifik dari employeeSalaries
        const empComps = allEmployeeSalaries.filter(es => es.employeeId === emp.id);

        // Loop ke semua master komponen
        for (const comp of allComponents) {
          const setup = empComps.find(es => es.componentId === comp.id);
          const amount = setup ? setup.amount : comp.defaultAmount;

          if (amount > 0) {
            if (comp.type === "earning") {
              totalEarning += amount;
            } else {
              totalDeduction += amount;
            }

            detailsData.push({
              componentId: comp.id,
              componentName: comp.name,
              type: comp.type,
              amount: amount,
            });
          }
        }

        const netSalary = totalEarning - totalDeduction;

        // Create Payroll
        const [newPayroll] = await tx
          .insert(payrolls)
          .values({
            employeeId: emp.id,
            month: month,
            year: year,
            baseSalary: emp.baseSalary || 0,
            totalAllowance: totalEarning - (emp.baseSalary || 0),
            totalDeduction: totalDeduction,
            netSalary: netSalary,
            status: "draft",
          })
          .returning();

        // Create Details
        if (detailsData.length > 0) {
          await tx.insert(payrollDetails).values(
            detailsData.map(d => ({
              ...d,
              payrollId: newPayroll.id,
            }))
          );
        }
      }
    });

    return NextResponse.json({ success: true, message: "Generate slip gaji bulanan selesai" });
  } catch (error) {
    console.error("Payroll POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal men-generate penggajian" },
      { status: 500 }
    );
  }
}
