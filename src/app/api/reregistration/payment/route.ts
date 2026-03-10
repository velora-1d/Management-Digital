import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/reregistration/payment
 * Toggle pembayaran daftar ulang + jurnal + saldo kas (ACID)
 *
 * Input: { regId, field, amount, cashAccountId? }
 *   field: is_fee_paid | is_books_paid | is_uniform_paid | is_books_received | is_uniform_received
 *
 * Alur bayar (isPaid false → true):
 *   1. Upsert RegistrationPayment isPaid=true
 *   2. Jika field pembayaran (bukan 'received') + cashAccountId → buat jurnal + update saldo
 *
 * Alur revert (isPaid true → false):
 *   1. Update RegistrationPayment isPaid=false
 *   2. Void jurnal terkait + revert saldo
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

    const payableId = regId.toString();
    const payableType = "reregistration";

    const result = await prisma.$transaction(async (tx) => {
      let payment = await tx.registrationPayment.findFirst({
        where: { payableId, payableType, paymentType, deletedAt: null },
      });

      let newStatus = true;

      if (payment) {
        newStatus = !payment.isPaid;

        await tx.registrationPayment.update({
          where: { id: payment.id },
          data: {
            isPaid: newStatus,
            nominal: amount !== undefined ? amount : payment.nominal,
            paidAt: newStatus ? new Date().toISOString() : null,
          },
        });

        if (!newStatus && isMonetaryField) {
          // === REVERT: void jurnal terkait ===
          const relatedTx = await tx.generalTransaction.findFirst({
            where: {
              referenceType: "registration_payment",
              referenceId: String(payment.id),
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
        }
      } else {
        // Create new payment
        const payAmount = Number(amount) || 0;
        payment = await tx.registrationPayment.create({
          data: {
            payableId,
            payableType,
            paymentType,
            nominal: payAmount,
            isPaid: true,
            paidAt: new Date().toISOString(),
            unitId: user.unitId || "",
          },
        });
        newStatus = true;
      }

      // === BAYAR: buat jurnal + update saldo ===
      if (newStatus && isMonetaryField && cashAccountId) {
        const payAmount = Number(amount) || Number(payment.nominal) || 0;
        if (payAmount > 0) {
          await tx.generalTransaction.create({
            data: {
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
            },
          });

          await tx.cashAccount.update({
            where: { id: Number(cashAccountId) },
            data: { balance: { increment: payAmount } },
          });
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
    return NextResponse.json(
      { error: "Gagal memperbarui status pembayaran" },
      { status: 500 }
    );
  }
}
