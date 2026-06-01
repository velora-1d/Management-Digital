import { NextResponse } from "next/server";
import { db } from "@/db";
import { extracurriculars, employees } from "@/db/schema";
import { eq, isNull, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/extracurriculars — Ambil daftar Ekstrakurikuler
 */
export async function GET() {
  try {
    await requireAuth();

    const data = await db
      .select({
        id: extracurriculars.id,
        name: extracurriculars.name,
        schedule: extracurriculars.schedule,
        status: extracurriculars.status,
        employee: {
          id: employees.id,
          name: employees.name,
        }
      })
      .from(extracurriculars)
      .leftJoin(employees, eq(extracurriculars.employeeId, employees.id))
      .where(isNull(extracurriculars.deletedAt))
      .orderBy(asc(extracurriculars.name));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch extracurriculars error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data ekstrakurikuler" }, { status: 500 });
  }
}
