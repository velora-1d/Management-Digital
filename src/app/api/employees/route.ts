import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, asc, ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'guru' or 'staf'
  const search = searchParams.get("q") || "";

  try {
    const conditions = [isNull(employees.deletedAt)];
    if (type) {
      conditions.push(eq(employees.type, type));
    }
    if (search) {
      const searchCondition = or(
        ilike(employees.name, `%${search}%`),
        ilike(employees.nip, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const data = await db
      .select()
      .from(employees)
      .where(and(...conditions))
      .orderBy(asc(employees.name));

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Employees GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}
