import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/tabungan/transaction
 * 
 * Setor atau tarik tabungan siswa.
 * Input: { studentId, type (setor/tarik), amount, date, description }
 * Logic:
 *   1. Validasi siswa aktif
 *   2. Hitung saldo saat ini
 *   3. Jika tarik → validasi saldo cukup
 *   4. Buat StudentSaving record dengan balanceAfter
 *   5. Dalam $transaction
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { studentId, type, amount, date, description } = body;

    // Validasi input
    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "ID siswa wajib diisi" },
        { status: 400 }
      );
    }
    if (!type || !["setor", "tarik"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Tipe harus 'setor' atau 'tarik'" },
        { status: 400 }
      );
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah harus lebih dari 0" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validasi siswa
      const student = await tx.student.findUnique({
        where: { id: Number(studentId) },
        select: { id: true, name: true, status: true, deletedAt: true },
      });

      if (!student || student.deletedAt) throw new Error("Siswa tidak ditemukan");
      if (student.status !== "aktif") throw new Error("Siswa tidak aktif");

      // 2. Hitung saldo sekarang
      const savings = await tx.studentSaving.findMany({
        where: { studentId: student.id, deletedAt: null, status: "active" },
      });

      let currentBalance = 0;
      savings.forEach(s => {
        if (s.type === "setor") currentBalance += s.amount;
        else if (s.type === "tarik") currentBalance -= s.amount;
      });

      // 3. Validasi saldo untuk penarikan
      if (type === "tarik" && currentBalance < Number(amount)) {
        throw new Error(
          `Saldo tidak cukup. Saldo: Rp ${currentBalance.toLocaleString("id-ID")}, Diminta: Rp ${Number(amount).toLocaleString("id-ID")}`
        );
      }

      // 4. Hitung saldo setelah transaksi
      const newBalance = type === "setor"
        ? currentBalance + Number(amount)
        : currentBalance - Number(amount);

      // 5. Buat record tabungan
      const saving = await tx.studentSaving.create({
        data: {
          studentId: student.id,
          type,
          amount: Number(amount),
          balanceAfter: newBalance,
          date: date || new Date().toISOString().split("T")[0],
          description: description || "",
          status: "active",
          unitId: user.unitId || "",
        },
      });

      // 6. Jurnal otomatis + update saldo kas
      // Setor: uang masuk ke tabungan siswa → jurnal type "in" (penerimaan titipan)
      // Tarik: uang keluar dari tabungan siswa → jurnal type "out" (pengembalian titipan)
      const txDate = date || new Date().toISOString().split("T")[0];

      // Cari akun kas default (pertama yang aktif)
      const defaultCash = await tx.cashAccount.findFirst({
        where: { deletedAt: null },
        orderBy: { id: "asc" },
      });

      if (defaultCash) {
        await tx.generalTransaction.create({
          data: {
            type: type === "setor" ? "in" : "out",
            amount: Number(amount),
            cashAccountId: defaultCash.id,
            description: `Tabungan ${type} - ${student.name}${description ? ` (${description})` : ""}`,
            date: txDate,
            status: "valid",
            referenceType: "student_saving",
            referenceId: String(saving.id),
            userId: user.userId,
            unitId: user.unitId || "",
          },
        });

        // Update saldo kas: setor → uang masuk ke kas, tarik → uang keluar dari kas
        if (type === "setor") {
          await tx.cashAccount.update({
            where: { id: defaultCash.id },
            data: { balance: { increment: Number(amount) } },
          });
        } else {
          await tx.cashAccount.update({
            where: { id: defaultCash.id },
            data: { balance: { decrement: Number(amount) } },
          });
        }
      }

      return { saving, student, currentBalance, newBalance };
    });

    return NextResponse.json({
      success: true,
      message: `${type === "setor" ? "Setoran" : "Penarikan"} Rp ${Number(amount).toLocaleString("id-ID")} untuk ${result.student.name} berhasil. Saldo: Rp ${result.newBalance.toLocaleString("id-ID")}`,
      data: {
        id: result.saving.id,
        previousBalance: result.currentBalance,
        newBalance: result.newBalance,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal memproses tabungan";
    console.error("Tabungan transaction error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
