import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrationPayments, generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * POST /api/reregistration/payment
 * Toggle pembayaran daftar ulang + jurnal + saldo kas (ACID)
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { regId, field, amount, cashAccountId } = body;

    if (!regId || !field) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    let paymentType = "";
    if (field === "is_fee_paid") paymentType = "fee";
    else if (field === "is_books_paid") paymentType = "books";
    else if (field === "is_uniform_paid") paymentType = "uniform";
    else if (field === "is_books_received") paymentType = "books_received";
    else if (field === "is_uniform_received") paymentType = "uniform_received";
    else {
      return NextResponse.json({ error: "Field tidak valid" }, { status: 400 });
    }

    // Cek apakah field ini melibatkan uang (bukan sekadar 'received')
    const isMonetaryField = ["fee", "books", "uniform"].includes(paymentType);
    const payableId = Number(regId);
    const payableType = "reregistration";

    const result = await db.transaction(async (tx) => {
      let [payment] = await tx
        .select()
        .from(registrationPayments)
        .where(
          and(
            eq(registrationPayments.payableId, payableId),
            eq(registrationPayments.payableType, payableType),
            eq(registrationPayments.paymentType, paymentType),
            isNull(registrationPayments.deletedAt)
          )
        )
        .limit(1);

      let newStatus = true;

      if (payment) {
        newStatus = !payment.isPaid;

        await tx
          .update(registrationPayments)
          .set({
            isPaid: newStatus,
            nominal: amount !== undefined ? Number(amount) : payment.nominal,
            paidAt: newStatus ? new Date().toISOString() : null,
            updatedAt: new Date(),
          })
          .where(eq(registrationPayments.id, payment.id));

        if (!newStatus && isMonetaryField) {
          // === REVERT: void jurnal terkait ===
          const [relatedTx] = await tx
            .select()
            .from(generalTransactions)
            .where(
              and(
                eq(generalTransactions.referenceType, "registration_payment"),
                eq(generalTransactions.referenceId, String(payment.id)),
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
        }
      } else {
        // Create new payment record
        const payAmount = Number(amount) || 0;
        const [newPayment] = await tx
          .insert(registrationPayments)
          .values({
            payableId,
            payableType,
            paymentType,
            nominal: payAmount,
            isPaid: true,
            paidAt: new Date().toISOString(),
            unitId: user.unitId || "",
          })
          .returning();
        
        payment = newPayment;
        newStatus = true;
      }

      // === BAYAR: buat jurnal + update saldo ===
      if (newStatus && isMonetaryField && cashAccountId) {
        const payAmount = Number(amount) || Number(payment.nominal) || 0;
        if (payAmount > 0) {
          await tx.insert(generalTransactions).values({
            type: "in",
            amount: payAmount,
            cashAccountId: Number(cashAccountId),
            description: `Daftar Ulang - ${paymentType} #${payableId}`,
            date: new Date().toISOString().split("T")[0],
            status: "valid",
            referenceType: "registration_payment",
            referenceId: String(payment.id),
            userId: user.userId,
            unitId: user.unitId || "",
          });

          await tx
            .update(cashAccounts)
            .set({ balance: sql`${cashAccounts.balance} + ${payAmount}` })
            .where(eq(cashAccounts.id, Number(cashAccountId)));
        }
      }

      return { newStatus, paymentType };
    });

    return NextResponse.json({
      success: true,
      message: `Status ${result.paymentType} berhasil diubah menjadi ${result.newStatus ? "Selesai" : "Belum"}`,
      newState: result.newStatus,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Reregistration Payment error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pembayaran" },
      { status: 500 }
    );
  }
}
