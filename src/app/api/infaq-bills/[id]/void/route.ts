import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/[id]/void
 * 
 * Void tagihan infaq — sesuai Laravel:
 * - TOLAK jika tagihan sudah lunas
 * - TOLAK jika sudah ada pembayaran (hapus pembayaran dulu)
 * - Hanya ubah status → 'void'
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const billId = Number(params.id);

    if (isNaN(billId)) {
      return NextResponse.json(
        { success: false, message: "ID tagihan tidak valid" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const bill = await tx.infaqBill.findUnique({
        where: { id: billId },
        include: { payments: { where: { deletedAt: null } } },
      });

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");
      if (bill.status === "void") throw new Error("Tagihan sudah berstatus void");

      // Sesuai Laravel: tolak void jika tagihan sudah lunas
      if (bill.status === "lunas") {
        throw new Error("Tagihan yang sudah LUNAS tidak dapat dibatalkan (void).");
      }

      // Sesuai Laravel: tolak void jika sudah ada riwayat pembayaran
      if (bill.payments.length > 0) {
        throw new Error("Tagihan ini memiliki riwayat pembayaran. Hapus pembayaran terlebih dahulu sebelum me-void tagihan.");
      }

      // Update status bill ke void
      await tx.infaqBill.update({
        where: { id: bill.id },
        data: { status: "void" },
      });

      return {};
    });

    return NextResponse.json({
      success: true,
      message: "Tagihan berhasil dibatalkan (void).",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal void tagihan";
    console.error("Void bill error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
