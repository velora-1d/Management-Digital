import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrationPayments, generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * POST /api/quick-payment/[id]/toggle
 * 
 * Toggle pembayaran item (formulir/buku/seragam) untuk PPDB/Daftar Ulang.
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

    const result = await db.transaction(async (tx) => {
      const [payment] = await tx
        .select()
        .from(registrationPayments)
        .where(eq(registrationPayments.id, paymentId))
        .limit(1);

      if (!payment) throw new Error("Payment item tidak ditemukan");
      if (payment.deletedAt) throw new Error("Payment sudah dihapus");

      if (!payment.isPaid) {
        // === TOGGLE ON: Bayar ===
        const payAmount = Number(amount) || payment.nominal;
        if (payAmount <= 0) throw new Error("Nominal pembayaran harus lebih dari 0");

        // Update payment
        await tx
          .update(registrationPayments)
          .set({
            isPaid: true,
            nominal: payAmount,
            paidAt: new Date().toISOString(),
            updatedAt: new Date(),
          })
          .where(eq(registrationPayments.id, paymentId));

        // Create jurnal (jika ada akun kas)
        if (cashAccountId) {
          await tx.insert(generalTransactions).values({
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
          });

          await tx
            .update(cashAccounts)
            .set({ balance: sql`${cashAccounts.balance} + ${payAmount}` })
            .where(eq(cashAccounts.id, Number(cashAccountId)));
        }

        return { action: "paid", amount: payAmount };
      } else {
        // === TOGGLE OFF: Revert ===
        await tx
          .update(registrationPayments)
          .set({ isPaid: false, paidAt: null, updatedAt: new Date() })
          .where(eq(registrationPayments.id, paymentId));

        // Void jurnal terkait
        const [relatedTx] = await tx
          .select()
          .from(generalTransactions)
          .where(
            and(
              eq(generalTransactions.referenceType, "registration_payment"),
              eq(generalTransactions.referenceId, String(paymentId)),
              eq(generalTransactions.status, "valid"),
              isNull(generalTransactions.deletedAt)
            )
          )
          .limit(1);

        if (relatedTx) {
          await tx
            .update(generalTransactions)
            .set({ status: "void", updatedAt: new Date() })
            .where(eq(generalTransactions.id, relatedTx.id));

          if (relatedTx.cashAccountId) {
            await tx
              .update(cashAccounts)
              .set({ balance: sql`${cashAccounts.balance} - ${relatedTx.amount}` })
              .where(eq(cashAccounts.id, relatedTx.cashAccountId));
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
