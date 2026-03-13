import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";


// GET /api/payroll/employees
export async function GET() {
  try {
    const result = await db
      .select({
        id: employees.id,
        name: employees.name,
        type: employees.type,
        position: employees.position,
        baseSalary: employees.baseSalary,
      })
      .from(employees)
      .where(and(eq(employees.status, "aktif"), isNull(employees.deletedAt)))
      .orderBy(asc(employees.name));
      
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}
