import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/reset
 * 
 * Reset (hard delete) tagihan infaq/SPP berdasarkan filter.
 * Input: { year, months?: number[], classroomId?: number, semester?: number }
 * 
 * Logic:
 *   1. Filter tagihan berdasarkan tahun + (bulan ATAU semester) + (kelas opsional)
 *   2. Validasi: tagihan yang sudah lunas TIDAK boleh di-reset
 *   3. Hard delete payment terkait + tagihan itu sendiri (dalam transaction)
 *   4. Return jumlah yang di-reset
 * 
 * PENTING: Format bulan menggunakan NAMA (Juli, Agustus, dll)
 *          agar konsisten dengan generate yang juga pakai nama.
 * 
 * Kepatuhan ACID:
 *   - Atomicity: semua operasi dalam $transaction
 *   - Consistency: validasi tagihan lunas sebelum delete
 *   - Isolation: Prisma transaction lock
 *   - Durability: hard delete, data bersih setelah reset
 */

const MONTH_NUM_TO_NAME: Record<number, string> = {
  1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
  5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
  9: "September", 10: "Oktober", 11: "November", 12: "Desember"
};

const SEMESTER_1_MONTHS = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const SEMESTER_2_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { year, months, classroomId, semester } = body;

    if (!year) {
      return NextResponse.json(
        { success: false, message: "Tahun wajib diisi" },
        { status: 400 }
      );
    }

    // ================================================
    // 1. Tentukan bulan berdasarkan filter
    //    PENTING: konversi angka → nama bulan agar match
    //    dengan format yang disimpan saat generate
    // ================================================
    let targetMonths: string[] = [];

    if (months && Array.isArray(months) && months.length > 0) {
      // Konversi angka bulan ke nama bulan
      targetMonths = months.map((m: number | string) => {
        const num = Number(m);
        return MONTH_NUM_TO_NAME[num] || String(m);
      });
    } else if (semester) {
      const sem = Number(semester);
      if (sem === 1) {
        targetMonths = [...SEMESTER_1_MONTHS];
      } else if (sem === 2) {
        targetMonths = [...SEMESTER_2_MONTHS];
      } else {
        return NextResponse.json(
          { success: false, message: "Semester harus 1 atau 2" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Pilih bulan atau semester yang akan di-reset" },
        { status: 400 }
      );
    }

    // ================================================
    // 2. Build where clause
    // ================================================
    const where: any = {
      year: String(year),
      month: { in: targetMonths },
      deletedAt: null,
    };

    // Filter per kelas: cari studentId yang ada di kelas tersebut
    if (classroomId) {
      const studentsInClass = await prisma.student.findMany({
        where: { classroomId: Number(classroomId), deletedAt: null },
        select: { id: true },
      });
      where.studentId = { in: studentsInClass.map(s => s.id) };
    }

    // ================================================
    // 3. Hitung dan validasi sebelum reset
    // ================================================
    const billsToReset = await prisma.infaqBill.findMany({
      where,
      select: { id: true, status: true, month: true },
      orderBy: { month: "asc" },
    });

    if (billsToReset.length === 0) {
      return NextResponse.json(
        { success: false, message: `Tidak ada tagihan yang ditemukan untuk filter tersebut. Bulan: [${targetMonths.join(", ")}], Tahun: ${year}` },
        { status: 400 }
      );
    }

    // Cek apakah ada tagihan lunas yang masih punya pembayaran valid
    const lunasBills = billsToReset.filter(b => b.status === "lunas");
    if (lunasBills.length > 0) {
      // Periksa apakah ada pembayaran aktif di tagihan lunas
      const paymentCount = await prisma.infaqPayment.count({
        where: {
          billId: { in: lunasBills.map(b => b.id) },
          deletedAt: null,
        },
      });

      if (paymentCount > 0) {
        return NextResponse.json({
          success: false,
          message: `Terdapat ${lunasBills.length} tagihan yang sudah lunas dengan ${paymentCount} pembayaran aktif. Void tagihan terlebih dahulu sebelum reset, atau hapus manual satu per satu.`,
        }, { status: 400 });
      }
    }

    const billIds = billsToReset.map(b => b.id);

    // ================================================
    // 4. Eksekusi HARD DELETE dalam transaction (atomik)
    //    Urutan: hapus payment → hapus bill
    //    (menjaga referential integrity)
    // ================================================
    await prisma.$transaction(async (tx) => {
      // 1. Delete semua payment terkait (hard delete)
      await tx.infaqPayment.deleteMany({
        where: { billId: { in: billIds } },
      });

      // 2. Delete semua tagihan (hard delete)
      await tx.infaqBill.deleteMany({
        where: { id: { in: billIds } },
      });
    });

    const monthDesc = semester
      ? `Semester ${semester}`
      : `bulan ${targetMonths.join(", ")}`;
    const filterDesc = classroomId ? ` untuk kelas tersebut` : "";

    return NextResponse.json({
      success: true,
      message: `Berhasil reset ${billsToReset.length} tagihan (${monthDesc}, ${year}${filterDesc})`,
      count: billsToReset.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Reset infaq bills error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal reset tagihan" },
      { status: 500 }
    );
  }
}
