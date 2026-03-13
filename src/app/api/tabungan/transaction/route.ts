import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentSavings, generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, asc, sql } from "drizzle-orm";

/**
 * POST /api/tabungan/transaction
 * Setor atau tarik tabungan siswa.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { studentId, type, amount, date, description } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, message: "ID siswa wajib diisi" }, { status: 400 });
    }
    if (!type || !["setor", "tarik"].includes(type)) {
      return NextResponse.json({ success: false, message: "Tipe harus 'setor' atau 'tarik'" }, { status: 400 });
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, message: "Jumlah harus lebih dari 0" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // 1. Validasi siswa
      const [student] = await tx.select({ id: students.id, name: students.name, status: students.status, deletedAt: students.deletedAt })
        .from(students).where(eq(students.id, Number(studentId))).limit(1);

      if (!student || student.deletedAt) throw new Error("Siswa tidak ditemukan");
      if (student.status !== "aktif") throw new Error("Siswa tidak aktif");

      // 2. Hitung saldo sekarang
      const [{ totalSetor }] = await tx.select({ totalSetor: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
        .from(studentSavings).where(and(eq(studentSavings.studentId, student.id), eq(studentSavings.type, "setor" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

      const [{ totalTarik }] = await tx.select({ totalTarik: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
        .from(studentSavings).where(and(eq(studentSavings.studentId, student.id), eq(studentSavings.type, "tarik" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

      const currentBalance = totalSetor - totalTarik;

      // 3. Validasi saldo untuk penarikan
      if (type === "tarik" && currentBalance < Number(amount)) {
        throw new Error(
          `Saldo tidak cukup. Saldo: Rp ${currentBalance.toLocaleString("id-ID")}, Diminta: Rp ${Number(amount).toLocaleString("id-ID")}`
        );
      }

      const newBalance = type === "setor" ? currentBalance + Number(amount) : currentBalance - Number(amount);

      // 5. Buat record tabungan
      const [saving] = await tx.insert(studentSavings).values({
        studentId: student.id,
        type: type as any,
        amount: Number(amount),
        balanceAfter: newBalance,
        date: date || new Date().toISOString().split("T")[0],
        description: description || "",
        status: "active" as any,
        unitId: user.unitId || "",
      }).returning();

      // 6. Jurnal otomatis + update saldo kas
      const txDate = date || new Date().toISOString().split("T")[0];
      const [defaultCash] = await tx.select().from(cashAccounts).where(isNull(cashAccounts.deletedAt)).orderBy(asc(cashAccounts.id)).limit(1);

      if (defaultCash) {
        await tx.insert(generalTransactions).values({
          type: (type === "setor" ? "in" : "out") as any,
          amount: Number(amount),
          cashAccountId: defaultCash.id,
          description: `Tabungan ${type} - ${student.name}${description ? ` (${description})` : ""}`,
          date: txDate,
          status: "valid" as any,
          referenceType: "student_saving",
          referenceId: String(saving.id),
          userId: user.userId,
          unitId: user.unitId || "",
        });

        // Update saldo kas
        const balanceChange = type === "setor" ? Number(amount) : -Number(amount);
        await tx.update(cashAccounts)
          .set({ balance: sql`${cashAccounts.balance} + ${balanceChange}` })
          .where(eq(cashAccounts.id, defaultCash.id));
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
