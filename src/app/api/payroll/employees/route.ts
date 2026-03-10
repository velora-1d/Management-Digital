import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/payroll/employees
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, status: "aktif" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        position: true,
        baseSalary: true,
      },
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}
