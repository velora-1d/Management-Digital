import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/journal/[id]/void
 * 
 * Void transaksi jurnal — membatalkan transaksi dan revert saldo kas.
 * Logic: 
 *   1. Update status → 'void'
 *   2. Revert saldo kas (kebalikan dari saat pencatatan)
 *   3. Dalam $transaction
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const txId = Number(params.id);

    if (isNaN(txId)) {
      return NextResponse.json(
        { success: false, message: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.generalTransaction.findUnique({
        where: { id: txId },
      });

      if (!transaction) throw new Error("Transaksi tidak ditemukan");
      if (transaction.deletedAt) throw new Error("Transaksi sudah dihapus");
      if (transaction.status === "void") throw new Error("Transaksi sudah di-void sebelumnya");

      // Revert saldo kas (kebalikan)
      if (transaction.cashAccountId) {
        const revertAmount = transaction.type === "in"
          ? -transaction.amount  // Pemasukan di-void → kurangi saldo
          : transaction.amount;  // Pengeluaran di-void → tambah saldo

        await tx.cashAccount.update({
          where: { id: transaction.cashAccountId },
          data: { balance: { increment: revertAmount } },
        });
      }

      // Update status ke void
      await tx.generalTransaction.update({
        where: { id: txId },
        data: { status: "void" },
      });

      return { type: transaction.type, amount: transaction.amount };
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi ${result.type === "in" ? "pemasukan" : "pengeluaran"} Rp ${result.amount.toLocaleString("id-ID")} berhasil di-void. Saldo kas sudah dikembalikan.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal void transaksi";
    console.error("Void journal error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
