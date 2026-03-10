import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/ppdb/fix-payments
 * Re-generate RegistrationPayment records untuk semua pendaftar yang sudah "diterima"
 * tapi belum punya payment records. Idempotent: tidak buat ulang jika sudah ada.
 */
export async function POST() {
  try {
    await requireAuth();

    const accepted = await prisma.ppdbRegistration.findMany({
      where: { status: "diterima", deletedAt: null },
      select: { id: true, name: true },
    });

    if (accepted.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada pendaftar yang perlu diperbaiki.", fixed: 0 });
    }

    // Ambil settings biaya
    const feeKeys = ["ppdb_fee_daftar", "ppdb_fee_buku", "ppdb_fee_seragam"];
    const settings = await prisma.schoolSetting.findMany({ where: { key: { in: feeKeys } } });
    const feeMap: Record<string, number> = {};
    settings.forEach((s: any) => { feeMap[s.key] = Number(s.value) || 0; });

    let fixedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const reg of accepted) {
        // Cek apakah sudah punya payment records
        const existingPayments = await tx.registrationPayment.findMany({
          where: { payableType: "ppdb", payableId: reg.id, deletedAt: null },
        });

        if (existingPayments.length > 0) continue; // Sudah ada, skip

        // Buat 3 payment items
        const paymentTypes = [
          { type: "daftar", nominal: feeMap["ppdb_fee_daftar"] || 0 },
          { type: "buku", nominal: feeMap["ppdb_fee_buku"] || 0 },
          { type: "seragam", nominal: feeMap["ppdb_fee_seragam"] || 0 },
        ];

        await tx.registrationPayment.createMany({
          data: paymentTypes.map(pt => ({
            payableType: "ppdb",
            payableId: reg.id,
            paymentType: pt.type,
            nominal: pt.nominal,
            isPaid: false,
            unitId: "",
          })),
        });

        fixedCount++;
      }
    });

    return NextResponse.json({
      success: true,
      message: `${fixedCount} pendaftar berhasil diperbaiki. ${accepted.length - fixedCount} sudah punya data pembayaran.`,
      fixed: fixedCount,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memperbaiki data pembayaran" }, { status: 500 });
  }
}
