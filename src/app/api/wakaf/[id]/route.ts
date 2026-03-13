import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, sql } from "drizzle-orm";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const { amount, description, date, wakafDonorId, wakafPurposeId } = body;

    const [txEntry] = await db.select().from(generalTransactions).where(eq(generalTransactions.id, id)).limit(1);
    if (!txEntry || txEntry.deletedAt) return NextResponse.json({ success: false, message: "Transaksi tidak ditemukan" }, { status: 404 });
    if (txEntry.status === "void") return NextResponse.json({ success: false, message: "Tidak bisa edit transaksi yang sudah void" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const oldAmount = txEntry.amount;
      const newAmount = amount !== undefined ? Number(amount) : oldAmount;
      if (txEntry.cashAccountId && newAmount !== oldAmount) {
        const diff = newAmount - oldAmount;
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${diff}` }).where(eq(cashAccounts.id, txEntry.cashAccountId));
      }

      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (amount !== undefined) updateData.amount = Number(amount);
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = date;
      if (wakafDonorId !== undefined) updateData.wakafDonorId = wakafDonorId ? Number(wakafDonorId) : null;
      if (wakafPurposeId !== undefined) updateData.wakafPurposeId = wakafPurposeId ? Number(wakafPurposeId) : null;

      const [updated] = await tx.update(generalTransactions).set(updateData).where(eq(generalTransactions.id, id)).returning();
      return updated;
    });

    return NextResponse.json({ success: true, message: "Transaksi wakaf berhasil diupdate.", data: result });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal update transaksi" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const [entry] = await tx.select().from(generalTransactions).where(eq(generalTransactions.id, id)).limit(1);
      if (!entry || entry.deletedAt) throw new Error("Transaksi tidak ditemukan");
      if (entry.status === "void") throw new Error("Transaksi sudah void");

      await tx.update(generalTransactions).set({ status: "void" as any, deletedAt: new Date() }).where(eq(generalTransactions.id, id));
      if (entry.cashAccountId) {
        const revertAmount = entry.type === "in" ? -entry.amount : entry.amount;
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${revertAmount}` }).where(eq(cashAccounts.id, entry.cashAccountId));
      }
      return { amount: entry.amount };
    });

    return NextResponse.json({ success: true, message: `Transaksi wakaf Rp ${result.amount.toLocaleString("id-ID")} berhasil dihapus.` });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    const msg = error instanceof Error ? error.message : "Gagal hapus transaksi";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
