import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, isNull, sql } from "drizzle-orm";

/**
 * POST /api/journal/create
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { type, amount, cashAccountId, categoryId, date, description } = body;

    if (!type || !["in", "out"].includes(type)) {
      return NextResponse.json({ success: false, message: "Tipe transaksi harus 'in' atau 'out'" }, { status: 400 });
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, message: "Jumlah harus lebih dari 0" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      let cashAccount: any = null;
      let newBalance: number | null = null;

      if (cashAccountId) {
        const [ca] = await tx.select().from(cashAccounts).where(eq(cashAccounts.id, Number(cashAccountId))).limit(1);
        cashAccount = ca;
        if (!cashAccount || cashAccount.deletedAt) throw new Error("Akun kas tidak ditemukan");
        if (type === "out" && cashAccount.balance < Number(amount)) {
          throw new Error(`Saldo tidak cukup. Saldo: Rp ${cashAccount.balance.toLocaleString("id-ID")}, Dibutuhkan: Rp ${Number(amount).toLocaleString("id-ID")}`);
        }
      }

      const [transaction] = await tx.insert(generalTransactions).values({
        type: type as any,
        amount: Number(amount),
        cashAccountId: cashAccountId ? Number(cashAccountId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        date: date || new Date().toISOString().split("T")[0],
        description: description || "",
        status: "valid" as any,
        userId: user.userId,
        unitId: user.unitId || "",
      }).returning();

      if (cashAccount) {
        const balanceChange = type === "in" ? Number(amount) : -Number(amount);
        await tx.update(cashAccounts)
          .set({ balance: sql`${cashAccounts.balance} + ${balanceChange}` })
          .where(eq(cashAccounts.id, cashAccount.id));
        newBalance = cashAccount.balance + balanceChange;
      }

      return { transaction, newBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi ${type === "in" ? "pemasukan" : "pengeluaran"} Rp ${Number(amount).toLocaleString("id-ID")} berhasil dicatat`,
      data: { id: result.transaction.id, newBalance: result.newBalance },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal mencatat transaksi";
    console.error("Journal POST error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
