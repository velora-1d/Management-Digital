import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeAttendances } from "@/db/schema";
import { eq, asc, sql, like } from "drizzle-orm";

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
      .where(eq(employees.status, "aktif" as any));

    const empList = await db.select({
      id: employees.id,
      name: employees.name,
      position: employees.position,
    })
    .from(employees)
    .where(eq(employees.status, "aktif" as any))
    .orderBy(asc(employees.name))
    .limit(limit > 0 ? limit : 1000)
    .offset(limit > 0 ? skip : 0);

    // Ambil semua absensi bulan ini
    const attendances = await db.select()
      .from(employeeAttendances)
      .where(like(employeeAttendances.date, `${prefix}%`));

    // ⚡ Bolt: Pre-aggregate employee attendance data in memory for O(1) lookups
    const attendanceMap = new Map<number, { hadir: number; sakit: number; izin: number; alpha: number; total: number }>();
    for (const record of attendances) {
      if (record.employeeId === null) continue;

      if (!attendanceMap.has(record.employeeId)) {
        attendanceMap.set(record.employeeId, { hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0 });
      }

      const counts = attendanceMap.get(record.employeeId)!;
      counts.total++;
      if (record.status === "hadir" || record.status === "sakit" || record.status === "izin" || record.status === "alpha") {
         counts[record.status]++;
      }
    }

    // Kalkulasi rekap per karyawan (O(N) instead of O(N * M))
    const recap = empList.map(emp => {
      const stats = attendanceMap.get(emp.id) || { hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0 };
      const persen = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

      return {
        employeeId: emp.id,
        name: emp.name,
        position: emp.position,
        total: stats.total,
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
