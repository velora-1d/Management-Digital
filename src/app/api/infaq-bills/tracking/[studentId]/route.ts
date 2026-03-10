import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/infaq-bills/tracking/[studentId]
 * 
 * Tracking 12 bulan tagihan infaq per siswa.
 * Return: array 12 bulan dengan status dan total pembayaran per bulan.
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const params = await props.params;
    const studentId = Number(params.studentId);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { success: false, message: "ID siswa tidak valid" },
        { status: 400 }
      );
    }

    // Ambil data siswa
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, nisn: true, classroomId: true, infaqNominal: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil parameter tahun dari query string (default tahun ini)
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    // Ambil semua tagihan siswa ini untuk tahun tersebut
    const bills = await prisma.infaqBill.findMany({
      where: {
        studentId: student.id,
        year: year,
        deletedAt: null,
      },
      include: {
        payments: {
          where: { deletedAt: null },
          select: { id: true, amountPaid: true, paymentDate: true },
        },
      },
      orderBy: { month: "asc" },
    });

    // Buat tracking 12 bulan
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const tracking = namaBulan.map((namaBln, idx) => {
      const monthStr = String(idx + 1);
      const bill = bills.find(b => b.month === monthStr || b.month === String(idx + 1).padStart(2, "0"));

      if (!bill) {
        return {
          month: monthStr,
          monthName: namaBln,
          status: "belum_digenerate",
          nominal: student.infaqNominal || 0,
          totalPaid: 0,
          remaining: student.infaqNominal || 0,
          payments: [],
        };
      }

      const totalPaid = bill.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        month: bill.month,
        monthName: namaBln,
        billId: bill.id,
        status: bill.status,
        nominal: bill.nominal,
        totalPaid,
        remaining: Math.max(0, bill.nominal - totalPaid),
        payments: bill.payments,
      };
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        nisn: student.nisn,
        infaqNominal: student.infaqNominal,
      },
      year,
      tracking,
      summary: {
        totalNominal: tracking.reduce((s, t) => s + t.nominal, 0),
        totalPaid: tracking.reduce((s, t) => s + t.totalPaid, 0),
        totalRemaining: tracking.reduce((s, t) => s + t.remaining, 0),
        lunas: tracking.filter(t => t.status === "lunas").length,
        belumLunas: tracking.filter(t => t.status === "belum_lunas" || t.status === "sebagian").length,
        belumGenerate: tracking.filter(t => t.status === "belum_digenerate").length,
      },
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil tracking infaq" },
      { status: 500 }
    );
  }
}
