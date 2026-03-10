import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/quick-payment/[id]/toggle
 * 
 * Toggle pembayaran item (formulir/buku/seragam) untuk PPDB/Daftar Ulang.
 * Input: { field: "formulir"|"buku"|"seragam", amount: number, cashAccountId: number }
 * 
 * Logic ON (isPaid false → true):
 *   1. Update RegistrationPayment isPaid=true, nominal=amount, paidAt=now
 *   2. Create GeneralTransaction type=in
 *   3. Update saldo CashAccount
 * 
 * Logic OFF (isPaid true → false) — revert:
 *   1. Update RegistrationPayment isPaid=false
 *   2. Void GeneralTransaction terkait
 *   3. Revert saldo CashAccount
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const paymentId = Number(params.id);

    if (isNaN(paymentId)) {
      return NextResponse.json({ success: false, message: "ID payment tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { amount, cashAccountId } = body;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.registrationPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) throw new Error("Payment item tidak ditemukan");
      if (payment.deletedAt) throw new Error("Payment sudah dihapus");

      if (!payment.isPaid) {
        // === TOGGLE ON: Bayar ===
        const payAmount = Number(amount) || payment.nominal;
        if (payAmount <= 0) throw new Error("Nominal pembayaran harus lebih dari 0");

        // Update payment
        await tx.registrationPayment.update({
          where: { id: paymentId },
          data: {
            isPaid: true,
            nominal: payAmount,
            paidAt: new Date().toISOString(),
          },
        });

        // Create jurnal (jika ada akun kas)
        if (cashAccountId) {
          await tx.generalTransaction.create({
            data: {
              type: "in",
              amount: payAmount,
              cashAccountId: Number(cashAccountId),
              description: `Pembayaran ${payment.paymentType} - ${payment.payableType} #${payment.payableId}`,
              date: new Date().toISOString().split("T")[0],
              status: "valid",
              referenceType: "registration_payment",
              referenceId: String(paymentId),
              userId: user.userId,
              unitId: user.unitId || "",
            },
          });

          await tx.cashAccount.update({
            where: { id: Number(cashAccountId) },
            data: { balance: { increment: payAmount } },
          });
        }

        return { action: "paid", amount: payAmount };
      } else {
        // === TOGGLE OFF: Revert ===
        await tx.registrationPayment.update({
          where: { id: paymentId },
          data: { isPaid: false, paidAt: null },
        });

        // Void jurnal terkait
        const relatedTx = await tx.generalTransaction.findFirst({
          where: {
            referenceType: "registration_payment",
            referenceId: String(paymentId),
            status: "valid",
            deletedAt: null,
          },
        });

        if (relatedTx) {
          await tx.generalTransaction.update({
            where: { id: relatedTx.id },
            data: { status: "void" },
          });

          if (relatedTx.cashAccountId) {
            await tx.cashAccount.update({
              where: { id: relatedTx.cashAccountId },
              data: { balance: { decrement: relatedTx.amount } },
            });
          }
        }

        return { action: "reverted", amount: payment.nominal };
      }
    });

    return NextResponse.json({
      success: true,
      message: result.action === "paid"
        ? `Pembayaran Rp ${result.amount.toLocaleString("id-ID")} berhasil dicatat`
        : `Pembayaran Rp ${result.amount.toLocaleString("id-ID")} berhasil di-revert`,
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal toggle payment";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
