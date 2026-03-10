import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/payroll/components
export async function GET() {
  try {
    const components = await prisma.salaryComponent.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(components);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data komponen gaji" },
      { status: 500 }
    );
  }
}

// POST /api/payroll/components
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, defaultAmount = 0 } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama komponen wajib diisi" },
        { status: 400 }
      );
    }

    const component = await prisma.salaryComponent.create({
      data: {
        name,
        type: type || "earning", // 'earning' atau 'deduction'
        defaultAmount: Number(defaultAmount),
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat komponen gaji" },
      { status: 500 }
    );
  }
}
