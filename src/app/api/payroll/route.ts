import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payroll
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const whereClause: any = { deletedAt: null };
    if (month) whereClause.month = month;
    if (year) whereClause.year = year;

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where: whereClause,
        include: { employee: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payroll.count({ where: whereClause }),
    ]);

    const result = payrolls.map((p) => ({
      id: p.id,
      code: `PAY-${p.year}${p.month.padStart(2, '0')}-${p.id.toString().padStart(4, '0')}`,
      employee_name: p.employee?.name || "Unknown",
      total_earning: p.baseSalary + p.totalAllowance,
      total_deduction: p.totalDeduction,
      net_salary: p.netSalary,
      status: p.status,
      created_at: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: result,
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
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, status: "aktif" },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada pegawai aktif untuk digenerate" },
        { status: 400 }
      );
    }

    // 2. Ambil semua komponen gaji dan setup gaji pegawai
    const allComponents = await prisma.salaryComponent.findMany({
      where: { deletedAt: null },
    });

    const employeeSalaries = await prisma.employeeSalary.findMany({
      where: { deletedAt: null },
    });

    // 3. Generate slip gaji per pegawai dalam transaction
    await prisma.$transaction(async (tx) => {
      for (const emp of employees) {
        // Cek apakah sudah digenerate bulan ini
        const existing = await tx.payroll.findFirst({
          where: {
            employeeId: emp.id,
            month: month,
            year: year,
            deletedAt: null,
          },
        });

        if (existing) continue;

        // Hitung gaji
        let totalEarning = emp.baseSalary || 0;
        let totalDeduction = 0;
        const detailsData: { componentId: number | null; componentName: string; type: string; amount: number }[] = [];

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
        const empComps = employeeSalaries.filter(es => es.employeeId === emp.id);

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
        const newPayroll = await tx.payroll.create({
          data: {
            employeeId: emp.id,
            month: month,
            year: year,
            baseSalary: emp.baseSalary || 0,
            totalAllowance: totalEarning - (emp.baseSalary || 0),
            totalDeduction: totalDeduction,
            netSalary: netSalary,
            status: "draft",
          },
        });

        // Create Details
        if (detailsData.length > 0) {
          await tx.payrollDetail.createMany({
            data: detailsData.map(d => ({
              ...d,
              payrollId: newPayroll.id,
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Generate slip gaji bulanan selesai" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Gagal men-generate penggajian" },
      { status: 500 }
    );
  }
}
