import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeAttendances } from "@/db/schema";
import { isNull, and, eq, asc, sql } from "drizzle-orm";

// GET /api/employee-attendance?date=YYYY-MM-DD
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const empWhere = and(eq(employees.status, "aktif" as any), isNull(employees.deletedAt));

    const [{ total }] = await db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(employees).where(empWhere);

    const empList = await db.select({
      id: employees.id,
      name: employees.name,
      position: employees.position,
      status: employees.status,
    })
    .from(employees)
    .where(empWhere)
    .orderBy(asc(employees.name))
    .limit(limit > 0 ? limit : 1000)
    .offset(limit > 0 ? skip : 0);

    // Ambil absensi untuk tanggal tertentu
    let attendanceMap: Record<number, { id: number; status: string; note: string | null }> = {};
    if (date && empList.length > 0) {
      const empIds = empList.map(e => e.id);
      const attendances = await db.select()
        .from(employeeAttendances)
        .where(and(
          eq(employeeAttendances.date, date),
          sql`${employeeAttendances.employeeId} = ANY(${empIds})`
        ));
      attendances.forEach(a => {
        if (a.employeeId !== null) {
          attendanceMap[a.employeeId] = { id: a.id, status: a.status, note: a.note };
        }
      });
    }

    const data = empList.map(emp => ({
      employeeId: emp.id,
      employee: { id: emp.id, name: emp.name, position: emp.position, status: emp.status },
      status: attendanceMap[emp.id]?.status || "hadir",
      note: attendanceMap[emp.id]?.note || "",
      id: attendanceMap[emp.id]?.id || null,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat absensi pegawai";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/employee-attendance — Simpan massal
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, records } = body;

    if (!date || !records?.length) {
      return NextResponse.json({ error: "Tanggal dan data absensi wajib" }, { status: 400 });
    }

    let count = 0;
    await db.transaction(async (tx) => {
      for (const rec of records) {
        await tx.insert(employeeAttendances).values({
          employeeId: parseInt(rec.employeeId),
          date,
          status: rec.status || "hadir",
          note: rec.note || "",
        }).onConflictDoUpdate({
          target: [employeeAttendances.employeeId, employeeAttendances.date],
          set: {
            status: rec.status || "hadir",
            note: rec.note || "",
            updatedAt: new Date(),
          }
        });
        count++;
      }
    });

    return NextResponse.json({ count });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan absensi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
