import { NextResponse } from "next/server";
import { db } from "@/db";
import { salaryComponents } from "@/db/schema";
import { isNull, desc } from "drizzle-orm";


// GET /api/payroll/components
export async function GET() {
  try {
    const components = await db
      .select()
      .from(salaryComponents)
      .where(isNull(salaryComponents.deletedAt))
      .orderBy(desc(salaryComponents.id));
      
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

    const [component] = await db
      .insert(salaryComponents)
      .values({
        name,
        type: type || "earning", // 'earning' atau 'deduction'
        defaultAmount: Number(defaultAmount),
      })
      .returning();

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error("SalaryComponent POST error:", error);
    return NextResponse.json(
      { error: "Gagal membuat komponen gaji" },
      { status: 500 }
    );
  }
}
