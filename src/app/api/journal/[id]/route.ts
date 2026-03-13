import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, sql } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!id) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const body = await req.json();
    const { description, date, categoryId, amount, type } = body;

    const [existing] = await db.select().from(generalTransactions).where(eq(generalTransactions.id, id)).limit(1);
    if (!existing) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    if (existing.status === "void") return NextResponse.json({ success: false, message: "Data sudah void, tidak bisa diedit" }, { status: 400 });

    const oldAmount = existing.amount;
    const oldType = existing.type;
    const newAmount = Number(amount) || oldAmount;
    const newType = type || oldType;

    await db.transaction(async (tx) => {
      const accountId = existing.cashAccountId;
      if (accountId) {
        const revertOld = oldType === "in" ? -oldAmount : oldAmount;
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${revertOld}` }).where(eq(cashAccounts.id, accountId));
        const applyNew = newType === "in" ? newAmount : -newAmount;
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${applyNew}` }).where(eq(cashAccounts.id, accountId));
      }
      await tx.update(generalTransactions).set({
        description: description || existing.description,
        date: date || existing.date,
        categoryId: categoryId ? Number(categoryId) : existing.categoryId,
        amount: newAmount,
        type: newType as any,
        updatedAt: new Date(),
      }).where(eq(generalTransactions.id, id));
    });

    return NextResponse.json({ success: true, message: "Transaksi berhasil diperbarui" });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    console.error("Error updating journal:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!id) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const [entry] = await db.select().from(generalTransactions).where(eq(generalTransactions.id, id)).limit(1);
    if (!entry) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    if (entry.status === "void") return NextResponse.json({ success: false, message: "Transaksi sudah di-void" }, { status: 400 });

    await db.transaction(async (tx) => {
      if (entry.cashAccountId) {
        const revert = entry.type === "in" ? -entry.amount : entry.amount;
        await tx.update(cashAccounts).set({ balance: sql`${cashAccounts.balance} + ${revert}` }).where(eq(cashAccounts.id, entry.cashAccountId));
      }
      await tx.delete(generalTransactions).where(eq(generalTransactions.id, id));
    });

    return NextResponse.json({ success: true, message: "Transaksi berhasil dihapus" });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    console.error("Error deleting journal:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
