import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-bills/[id]/revert
 * 
 * Revert tagihan dari 'lunas' kembali ke 'belum_lunas' — sesuai Laravel:
 * - Hanya bisa revert tagihan berstatus LUNAS
 * - Ubah status saja, JANGAN hapus payment records
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
      });

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");

      // Sesuai Laravel: hanya tagihan berstatus LUNAS yang bisa di-revert
      if (bill.status !== "lunas") {
        throw new Error("Hanya tagihan berstatus LUNAS yang bisa di-revert.");
      }

      // Ubah status ke belum_lunas — JANGAN hapus payment records (sesuai Laravel)
      await tx.infaqBill.update({
        where: { id: bill.id },
        data: { status: "belum_lunas" },
      });

      return {};
    });

    return NextResponse.json({
      success: true,
      message: "Status tagihan berhasil dikembalikan ke Belum Lunas.",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal revert tagihan";
    console.error("Revert bill error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
