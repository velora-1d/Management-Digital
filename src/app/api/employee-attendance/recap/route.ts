import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeAttendances } from "@/db/schema";
import { eq, asc, sql, like } from "drizzle-orm";

type EmployeeStatus = typeof employees.$inferSelect.status;

// GET /api/employee-attendance/recap?month=3&year=2026
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const prefix = `${year}-${String(month).padStart(2, "0")}`;

    const [{ total }] = await db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(employees)
      .where(eq(employees.status, "aktif" as EmployeeStatus));

    const empList = await db.select({
      id: employees.id,
      name: employees.name,
      position: employees.position,
    })
    .from(employees)
    .where(eq(employees.status, "aktif" as EmployeeStatus))
    .orderBy(asc(employees.name))
    .limit(limit > 0 ? limit : 1000)
    .offset(limit > 0 ? skip : 0);

    // Ambil semua absensi bulan ini
    const attendances = await db.select()
      .from(employeeAttendances)
      .where(like(employeeAttendances.date, `${prefix}%`));

    // Pre-aggregate attendances by employeeId to convert O(N*M) lookup to O(N+M)
    const attendanceMap = new Map<number, { hadir: number, sakit: number, izin: number, alpha: number, totalAtt: number }>();
    for (const att of attendances) {
      if (att.employeeId === null) continue;
      if (!attendanceMap.has(att.employeeId)) {
        attendanceMap.set(att.employeeId, { hadir: 0, sakit: 0, izin: 0, alpha: 0, totalAtt: 0 });
      }
      const stats = attendanceMap.get(att.employeeId)!;
      stats.totalAtt++;
      if (att.status === "hadir") stats.hadir++;
      else if (att.status === "sakit") stats.sakit++;
      else if (att.status === "izin") stats.izin++;
      else if (att.status === "alpha") stats.alpha++;
    }

    const recap = empList.map(emp => {
      const stats = attendanceMap.get(emp.id) || { hadir: 0, sakit: 0, izin: 0, alpha: 0, totalAtt: 0 };
      const persen = stats.totalAtt > 0 ? Math.round((stats.hadir / stats.totalAtt) * 100) : 0;

      return {
        employeeId: emp.id,
        name: emp.name,
        position: emp.position,
        total: stats.totalAtt,
        hadir: stats.hadir,
        sakit: stats.sakit,
        izin: stats.izin,
        alpha: stats.alpha,
        persen,
      };
    });

    return NextResponse.json({
      month,
      year,
      recap,
      pagination: {
        total,
        page,
        limit,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat rekap absensi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
