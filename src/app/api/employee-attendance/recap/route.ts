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

    const recap = empList.map(emp => {
      const empAttendances = attendances.filter(a => a.employeeId === emp.id);
      const totalAtt = empAttendances.length;
      const hadir = empAttendances.filter(a => a.status === "hadir").length;
      const sakit = empAttendances.filter(a => a.status === "sakit").length;
      const izin = empAttendances.filter(a => a.status === "izin").length;
      const alpha = empAttendances.filter(a => a.status === "alpha").length;
      const persen = totalAtt > 0 ? Math.round((hadir / totalAtt) * 100) : 0;

      return {
        employeeId: emp.id,
        name: emp.name,
        position: emp.position,
        total: totalAtt,
        hadir,
        sakit,
        izin,
        alpha,
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
