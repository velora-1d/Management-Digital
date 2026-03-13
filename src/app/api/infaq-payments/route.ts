import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, infaqPayments, students, studentSavings, generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * POST /api/infaq-payments
 * Bayar tagihan infaq/SPP
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { billId, amountPaid, paymentDate, notes, paymentMethod, cashAccountId } = body;

    if (!billId) {
      return NextResponse.json(
        { success: false, message: "ID tagihan wajib diisi" },
        { status: 400 }
      );
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah pembayaran harus lebih dari 0" },
        { status: 400 }
      );
    }

    const method = paymentMethod || "tunai";
    const validMethods = ["tunai", "transfer", "tabungan"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, message: "Metode pembayaran tidak valid. Gunakan: tunai, transfer, atau tabungan" },
        { status: 400 }
      );
    }

    if (method !== "tabungan" && !cashAccountId) {
      return NextResponse.json(
        { success: false, message: "Akun kas wajib dipilih untuk pembayaran tunai/transfer" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      // 1. Ambil bill
      const [bill] = await tx.select().from(infaqBills).where(eq(infaqBills.id, Number(billId))).limit(1);

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");
      if (bill.status === "void") throw new Error("Tagihan sudah di-void, tidak bisa dibayar");
      if (bill.status === "lunas") throw new Error("Tagihan sudah lunas");

      // Ambil student name
      const [student] = bill.studentId
        ? await tx.select({ id: students.id, name: students.name }).from(students).where(eq(students.id, bill.studentId)).limit(1)
        : [undefined];

      // Ambil total pembayaran sebelumnya
      const [{ totalPaidBefore }] = await tx.select({
        totalPaidBefore: sql<number>`coalesce(sum(${infaqPayments.amountPaid}), 0)`.mapWith(Number)
      }).from(infaqPayments).where(and(eq(infaqPayments.billId, bill.id), isNull(infaqPayments.deletedAt)));

      const remaining = bill.nominal - totalPaidBefore;
      const amount = Number(amountPaid);

      if (amount > remaining) {
        throw new Error(
          `Jumlah pembayaran (Rp ${amount.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${remaining.toLocaleString("id-ID")})`
        );
      }

      // 3. Jika via tabungan — validasi saldo tabungan siswa
      if (method === "tabungan" && bill.studentId) {
        const [{ savingsIn }] = await tx.select({
          savingsIn: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number)
        }).from(studentSavings).where(and(eq(studentSavings.studentId, bill.studentId), eq(studentSavings.type, "setor" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

        const [{ savingsOut }] = await tx.select({
          savingsOut: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number)
        }).from(studentSavings).where(and(eq(studentSavings.studentId, bill.studentId), eq(studentSavings.type, "tarik" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

        const balance = savingsIn - savingsOut;

        if (amount > balance) {
          throw new Error(
            `Saldo tabungan tidak mencukupi! Saldo: Rp ${balance.toLocaleString("id-ID")}`
          );
        }

        await tx.insert(studentSavings).values({
          studentId: bill.studentId,
          type: "tarik" as any,
          amount: amount,
          date: paymentDate || new Date().toISOString().split("T")[0],
          description: `Potong Tabungan untuk bayar Infaq bulan ${bill.month}`,
          status: "active" as any,
          unitId: user.unitId || "",
        });
      }

      // 4. Buat payment record
      const [payment] = await tx.insert(infaqPayments).values({
        billId: bill.id,
        paymentMethod: method as any,
        amountPaid: amount,
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        notes: notes || "",
        unitId: user.unitId || "",
        receiverId: user.userId || null,
        cashAccountId: cashAccountId ? Number(cashAccountId) : null,
      }).returning();

      // 5. Update status bill
      const newTotalPaid = totalPaidBefore + amount;
      const newStatus = newTotalPaid >= bill.nominal ? "lunas" : "sebagian";
      await tx.update(infaqBills)
        .set({ status: newStatus as any, updatedAt: new Date() })
        .where(eq(infaqBills.id, bill.id));

      // 6. Buat jurnal + update saldo
      if (cashAccountId) {
        const studentName = student?.name || "Siswa";
        const monthNames: Record<string, string> = {
          "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun",
          "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
        };
        const bulan = monthNames[bill.month] || bill.month;

        await tx.insert(generalTransactions).values({
          date: paymentDate || new Date().toISOString().split("T")[0],
          description: `Pembayaran Infaq/SPP ${studentName} bulan ${bulan} (${method})`,
          amount: amount,
          type: "in" as any,
          referenceType: "infaq_payment",
          referenceId: String(payment.id),
          cashAccountId: Number(cashAccountId),
          unitId: user.unitId || "",
        });

        await tx.update(cashAccounts)
          .set({ balance: sql`${cashAccounts.balance} + ${amount}` })
          .where(eq(cashAccounts.id, Number(cashAccountId)));
      }

      return { payment, newStatus, newTotalPaid, nominal: bill.nominal, method };
    });

    const methodLabel = result.method === "tabungan" ? "Potong Tabungan" : result.method === "transfer" ? "Transfer" : "Tunai";

    return NextResponse.json({
      success: true,
      message: `Pembayaran Rp ${Number(amountPaid).toLocaleString("id-ID")} via ${methodLabel} berhasil. Status: ${result.newStatus}`,
      data: {
        paymentId: result.payment.id,
        status: result.newStatus,
        totalPaid: result.newTotalPaid,
        nominal: result.nominal,
        remaining: Math.max(0, result.nominal - result.newTotalPaid),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal memproses pembayaran";
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 400 }
    );
  }
}
