import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/employee-attendance/recap?month=3&year=2026
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const prefix = `${year}-${String(month).padStart(2, "0")}`;

    // Ambil semua pegawai aktif
    const employees = await prisma.employee.findMany({
      where: { status: "aktif" },
      select: { id: true, name: true, position: true },
      orderBy: { name: "asc" },
    });

    // Ambil semua absensi bulan ini
    const attendances = await prisma.employeeAttendance.findMany({
      where: { date: { startsWith: prefix } },
    });

    // Kalkulasi rekap per pegawai
    const recap = employees.map(emp => {
      const empAttendances = attendances.filter(a => a.employeeId === emp.id);
      const total = empAttendances.length;
      const hadir = empAttendances.filter(a => a.status === "hadir").length;
      const sakit = empAttendances.filter(a => a.status === "sakit").length;
      const izin = empAttendances.filter(a => a.status === "izin").length;
      const alpha = empAttendances.filter(a => a.status === "alpha").length;
      const persen = total > 0 ? Math.round((hadir / total) * 100) : 0;

      return {
        employeeId: emp.id,
        name: emp.name,
        position: emp.position,
        total,
        hadir,
        sakit,
        izin,
        alpha,
        persen,
      };
    });

    return NextResponse.json({ month, year, recap });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat rekap absensi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
