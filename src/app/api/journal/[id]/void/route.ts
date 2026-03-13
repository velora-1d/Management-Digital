import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const txId = Number(params.id);
    if (isNaN(txId)) return NextResponse.json({ success: false, message: "ID transaksi tidak valid" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const [transaction] = await tx.select().from(generalTransactions).where(eq(generalTransactions.id, txId)).limit(1);
      if (!transaction) throw new Error("Transaksi tidak ditemukan");
      if (transaction.deletedAt) throw new Error("Transaksi sudah dihapus");
      if (transaction.status === "void") throw new Error("Transaksi sudah di-void sebelumnya");

      if (transaction.cashAccountId) {
        const revertAmount = transaction.type === "in" ? -transaction.amount : transaction.amount;
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${revertAmount}` }).where(eq(cashAccounts.id, transaction.cashAccountId));
      }

      await tx.update(generalTransactions).set({ status: "void" as any, updatedAt: new Date() }).where(eq(generalTransactions.id, txId));
      return { type: transaction.type, amount: transaction.amount };
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi ${result.type === "in" ? "pemasukan" : "pengeluaran"} Rp ${result.amount.toLocaleString("id-ID")} berhasil di-void.`,
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    const msg = error instanceof Error ? error.message : "Gagal void transaksi";
    console.error("Void journal error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
