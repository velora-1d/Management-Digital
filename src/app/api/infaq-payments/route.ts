import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/infaq-payments
 * 
 * Bayar tagihan infaq/SPP — sesuai flow Laravel.
 * Input: { billId, amountPaid, paymentDate, notes, paymentMethod, cashAccountId }
 * 
 * Logic (dalam $transaction):
 *   1. Validasi bill exists + bukan void/lunas
 *   2. Validasi jumlah bayar tidak melebihi sisa tagihan
 *   3. Buat InfaqPayment
 *   4. Jika paymentMethod === 'tabungan' → buat StudentSaving (type out)
 *   5. Hitung total paid → update status bill (lunas/sebagian)
 *   6. Buat GeneralTransaction (jurnal) + update saldo CashAccount
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { billId, amountPaid, paymentDate, notes, paymentMethod, cashAccountId } = body;

    // Validasi input
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

    // Akun kas wajib untuk tunai/transfer
    if (method !== "tabungan" && !cashAccountId) {
      return NextResponse.json(
        { success: false, message: "Akun kas wajib dipilih untuk pembayaran tunai/transfer" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil bill + pembayaran sebelumnya
      const bill = await tx.infaqBill.findUnique({
        where: { id: Number(billId) },
        include: {
          payments: { where: { deletedAt: null } },
          student: { select: { id: true, name: true } },
        },
      });

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");
      if (bill.status === "void") throw new Error("Tagihan sudah di-void, tidak bisa dibayar");
      if (bill.status === "lunas") throw new Error("Tagihan sudah lunas");

      // 2. Hitung sisa tagihan — validasi tidak melebihi (sesuai Laravel)
      const totalPaidBefore = bill.payments.reduce(
        (sum, p) => sum + p.amountPaid, 0
      );
      const remaining = bill.nominal - totalPaidBefore;
      const amount = Number(amountPaid);

      if (amount > remaining) {
        throw new Error(
          `Jumlah pembayaran (Rp ${amount.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${remaining.toLocaleString("id-ID")})`
        );
      }

      // 3. Jika via tabungan — validasi saldo tabungan siswa
      if (method === "tabungan" && bill.studentId) {
        // Hitung saldo: sum setor - sum tarik
        const savingsIn = await tx.studentSaving.aggregate({
          where: { studentId: bill.studentId, type: "setor", status: "active", deletedAt: null },
          _sum: { amount: true },
        });
        const savingsOut = await tx.studentSaving.aggregate({
          where: { studentId: bill.studentId, type: "tarik", status: "active", deletedAt: null },
          _sum: { amount: true },
        });
        const balance = (savingsIn._sum.amount || 0) - (savingsOut._sum.amount || 0);

        if (amount > balance) {
          throw new Error(
            `Saldo tabungan tidak mencukupi! Saldo: Rp ${balance.toLocaleString("id-ID")}`
          );
        }

        // Buat mutasi debit tabungan siswa
        await tx.studentSaving.create({
          data: {
            studentId: bill.studentId,
            type: "tarik",
            amount: amount,
            date: paymentDate || new Date().toISOString().split("T")[0],
            description: `Potong Tabungan untuk bayar Infaq bulan ${bill.month}`,
            status: "active",
            unitId: user.unitId || "",
          },
        });
      }

      // 4. Buat payment record
      const paymentData: any = {
        bill: { connect: { id: bill.id } },
        paymentMethod: method,
        amountPaid: amount,
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        notes: notes || "",
        unitId: user.unitId || "",
      };
      if (user.userId) paymentData.receiver = { connect: { id: user.userId } };
      if (cashAccountId) paymentData.cashAccount = { connect: { id: Number(cashAccountId) } };

      const payment = await tx.infaqPayment.create({ data: paymentData });

      // 5. Update status bill
      const newTotalPaid = totalPaidBefore + amount;
      const newStatus = newTotalPaid >= bill.nominal ? "lunas" : "sebagian";
      await tx.infaqBill.update({
        where: { id: bill.id },
        data: { status: newStatus },
      });

      // 6. Buat jurnal (GeneralTransaction) + update saldo CashAccount
      if (cashAccountId) {
        const studentName = bill.student?.name || "Siswa";
        const monthNames: Record<string, string> = {
          "1": "Jan", "2": "Feb", "3": "Mar", "4": "Apr", "5": "Mei", "6": "Jun",
          "7": "Jul", "8": "Agu", "9": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
        };
        const bulan = monthNames[bill.month] || bill.month;

        await tx.generalTransaction.create({
          data: {
            date: paymentDate || new Date().toISOString().split("T")[0],
            description: `Pembayaran Infaq/SPP ${studentName} bulan ${bulan} (${method})`,
            amount: amount,
            type: "in",
            referenceType: "infaq_payment",
            referenceId: String(payment.id),
            cashAccountId: Number(cashAccountId),
            unitId: user.unitId || "",
          },
        });

        await tx.cashAccount.update({
          where: { id: Number(cashAccountId) },
          data: { balance: { increment: amount } },
        });
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
