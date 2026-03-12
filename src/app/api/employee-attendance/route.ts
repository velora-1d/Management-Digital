import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/employee-attendance?date=YYYY-MM-DD
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = { status: "aktif", deletedAt: null };
    
    // Hitung total pegawai aktif
    const total = await prisma.employee.count({ where });

    const employees = await prisma.employee.findMany({
      where,
      include: {
        employeeAttendances: {
          where: { date: date || "" }
        },
      },
      orderBy: { name: "asc" },
      skip: limit > 0 ? skip : undefined,
      take: limit > 0 ? limit : undefined,
    });

    // Transformasi data agar frontend tetap kompatibel (record = data[0] atau null)
    const data = employees.map(emp => ({
      employeeId: emp.id,
      employee: { 
        id: emp.id, 
        name: emp.name, 
        position: emp.position, 
        status: emp.status 
      },
      status: emp.employeeAttendances[0]?.status || "hadir",
      note: emp.employeeAttendances[0]?.note || "",
      id: emp.employeeAttendances[0]?.id || null, // ID record absensi jika ada
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

    const results = await prisma.$transaction(
      records.map((rec: any) =>
        prisma.employeeAttendance.upsert({
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
        })
      )
    );

    return NextResponse.json({ count: results.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan absensi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
