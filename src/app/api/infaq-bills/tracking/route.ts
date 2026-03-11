import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/infaq-bills/tracking?classroomId=X&year=Y&semester=1|2|full
 *
 * Tracking SPP per kelas — return semua siswa di kelas + tracking per bulan.
 * Semester 1 = bulan 7-12 (Jul-Des), Semester 2 = bulan 1-6 (Jan-Jun)
 * Full = bulan 7-12 + 1-6 (12 bulan, 1 tahun ajaran penuh)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = Number(searchParams.get("classroomId"));
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const semester = searchParams.get("semester") || "1";

    if (!classroomId || isNaN(classroomId)) {
      return NextResponse.json(
        { success: false, message: "classroomId wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil kelas
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { id: true, name: true, infaqNominal: true },
    });
    if (!classroom) {
      return NextResponse.json(
        { success: false, message: "Kelas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil siswa di kelas ini
    const students = await prisma.student.findMany({
      where: { classroomId, deletedAt: null },
      select: { id: true, name: true, nisn: true, infaqNominal: true, infaqStatus: true },
      orderBy: { name: "asc" },
    });

    // Tentukan bulan berdasarkan semester
    let months: number[];
    if (semester === "full") {
      // 1 tahun ajaran penuh: Juli–Juni (12 bulan)
      months = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
    } else if (semester === "2") {
      months = [1, 2, 3, 4, 5, 6];
    } else {
      months = [7, 8, 9, 10, 11, 12];
    }

    const monthNames: Record<number, string> = {
      1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mei", 6: "Jun",
      7: "Jul", 8: "Agu", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
    };

    // Ambil semua tagihan untuk siswa-siswa ini di tahun tersebut
    const studentIds = students.map(s => s.id);
    const bills = studentIds.length > 0
      ? await prisma.infaqBill.findMany({
          where: {
            studentId: { in: studentIds },
            year,
            deletedAt: null,
          },
          include: {
            payments: {
              where: { deletedAt: null },
              select: { amountPaid: true },
            },
          },
        })
      : [];

    // Index tagihan: key = `${studentId}-${month}`
    const billMap = new Map<string, typeof bills[0]>();
    for (const b of bills) {
      billMap.set(`${b.studentId}-${b.month}`, b);
    }

    // Build tracking per siswa
    const tracking = students.map(student => {
      const monthData = months.map(m => {
        const key = `${student.id}-${String(m)}`;
        const bill = billMap.get(key);

        if (!bill) {
          return {
            month: m,
            monthName: monthNames[m],
            billId: null,
            status: "belum_digenerate",
            nominal: 0,
            totalPaid: 0,
            remaining: 0,
          };
        }

        const totalPaid = bill.payments.reduce((sum, p) => sum + p.amountPaid, 0);
        return {
          month: m,
          monthName: monthNames[m],
          billId: bill.id,
          status: bill.status,
          nominal: bill.nominal,
          totalPaid,
          remaining: Math.max(0, bill.nominal - totalPaid),
        };
      });

      // Hitung summary per siswa
      const totalNominal = monthData.reduce((s, m) => s + m.nominal, 0);
      const totalPaid = monthData.reduce((s, m) => s + m.totalPaid, 0);

      return {
        id: student.id,
        name: student.name,
        nisn: student.nisn,
        infaqStatus: student.infaqStatus,
        months: monthData,
        totalNominal,
        totalPaid,
        totalRemaining: totalNominal - totalPaid,
        lunasCount: monthData.filter(m => m.status === "lunas").length,
      };
    });

    // Summary seluruh kelas
    const summary = {
      totalStudents: students.length,
      totalNominal: tracking.reduce((s, t) => s + t.totalNominal, 0),
      totalPaid: tracking.reduce((s, t) => s + t.totalPaid, 0),
      totalRemaining: tracking.reduce((s, t) => s + t.totalRemaining, 0),
      allLunas: tracking.filter(t => t.months.every(m => m.status === "lunas" || m.status === "belum_digenerate")).length,
      hasArrears: tracking.filter(t => t.totalRemaining > 0).length,
    };

    return NextResponse.json({
      success: true,
      classroom: { id: classroom.id, name: classroom.name, infaqNominal: classroom.infaqNominal },
      year,
      semester: Number(semester),
      months: months.map(m => ({ month: m, name: monthNames[m] })),
      tracking,
      summary,
    });
  } catch (error) {
    console.error("Tracking per kelas error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data tracking" },
      { status: 500 }
    );
  }
}
