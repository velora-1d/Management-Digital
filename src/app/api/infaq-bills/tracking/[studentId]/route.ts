import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, infaqBills, infaqPayments } from "@/db/schema";
import { eq, and, isNull, inArray, asc, sql } from "drizzle-orm";

/**
 * GET /api/infaq-bills/tracking/[studentId]
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ studentId: string }> }
) {
  try {
    const params = await props.params;
    const studentId = Number(params.studentId);

    if (isNaN(studentId)) {
      return NextResponse.json({ success: false, message: "ID siswa tidak valid" }, { status: 400 });
    }

    const [student] = await db.select({ id: students.id, name: students.name, nisn: students.nisn, infaqNominal: students.infaqNominal })
      .from(students).where(eq(students.id, studentId)).limit(1);

    if (!student) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    const bills = await db.select()
      .from(infaqBills)
      .where(and(eq(infaqBills.studentId, student.id), eq(infaqBills.year, year), isNull(infaqBills.deletedAt)))
      .orderBy(asc(infaqBills.month));

    // Get payments
    const billIds = bills.map(b => b.id);
    const paymentsByBill: Record<number, { id: number; amountPaid: number; paymentDate: string | null }[]> = {};
    if (billIds.length > 0) {
      const payments = await db.select({ id: infaqPayments.id, billId: infaqPayments.billId, amountPaid: infaqPayments.amountPaid, paymentDate: infaqPayments.paymentDate })
        .from(infaqPayments)
        .where(and(inArray(infaqPayments.billId, billIds), isNull(infaqPayments.deletedAt)));
      payments.forEach(p => {
        if (p.billId !== null) {
          if (!paymentsByBill[p.billId]) paymentsByBill[p.billId] = [];
          paymentsByBill[p.billId].push({ id: p.id, amountPaid: p.amountPaid, paymentDate: p.paymentDate });
        }
      });
    }

    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const tracking = namaBulan.map((namaBln, idx) => {
      const monthStr = String(idx + 1);
      const bill = bills.find(b => b.month === monthStr || b.month === String(idx + 1).padStart(2, "0"));

      if (!bill) {
        return {
          month: monthStr, monthName: namaBln, status: "belum_digenerate",
          nominal: student.infaqNominal || 0, totalPaid: 0, remaining: student.infaqNominal || 0, payments: [],
        };
      }

      const billPayments = paymentsByBill[bill.id] || [];
      const totalPaid = billPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      return {
        month: bill.month, monthName: namaBln, billId: bill.id, status: bill.status,
        nominal: bill.nominal, totalPaid, remaining: Math.max(0, bill.nominal - totalPaid), payments: billPayments,
      };
    });

    return NextResponse.json({
      success: true,
      student: { id: student.id, name: student.name, nisn: student.nisn, infaqNominal: student.infaqNominal },
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
    return NextResponse.json({ success: false, message: "Gagal mengambil tracking infaq" }, { status: 500 });
  }
}
