import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/employee-attendance?date=YYYY-MM-DD
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const where: Record<string, unknown> = {};
    if (date) where.date = date;

    const data = await prisma.employeeAttendance.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, position: true, status: true } },
      },
      orderBy: { employee: { name: "asc" } },
    });
    return NextResponse.json(data);
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

    const results = [];
    for (const rec of records) {
      const record = await prisma.employeeAttendance.upsert({
        where: {
          unique_employee_attendance: {
            employeeId: parseInt(rec.employeeId),
            date,
          },
        },
        update: {
          status: rec.status || "hadir",
          note: rec.note || "",
        },
        create: {
          employeeId: parseInt(rec.employeeId),
          date,
          status: rec.status || "hadir",
          note: rec.note || "",
        },
      });
      results.push(record);
    }

    return NextResponse.json({ count: results.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan absensi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
