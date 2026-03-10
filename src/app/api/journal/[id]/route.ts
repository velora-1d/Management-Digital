import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!id) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const body = await req.json();
    const { description, date, categoryId, amount, type } = body;

    const existingId = await prisma.generalTransaction.findUnique({
      where: { id }
    });

    if(!existingId) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    if(existingId.status === "void") return NextResponse.json({ success: false, message: "Data sudah void, tidak bisa diedit" }, { status: 400 });

    const oldAmount = existingId.amount;
    const oldType = existingId.type;
    const newAmount = Number(amount) || oldAmount;
    const newType = type || oldType;
    
    await prisma.$transaction(async (tx) => {
      const accountId = existingId.cashAccountId;
      
      if (accountId) {
        // 1. Revert the old value
        if (oldType === "in") {
          await tx.cashAccount.update({
            where: { id: accountId },
            data: { balance: { decrement: oldAmount } }
          });
        } else {
          await tx.cashAccount.update({
            where: { id: accountId },
            data: { balance: { increment: oldAmount } }
          });
        }

        // 2. Add the new value
        if (newType === "in") {
          await tx.cashAccount.update({
            where: { id: accountId },
            data: { balance: { increment: newAmount } }
          });
        } else {
          await tx.cashAccount.update({
            where: { id: accountId },
            data: { balance: { decrement: newAmount } }
          });
        }
      }

      // 3. Update the journal entry
      await tx.generalTransaction.update({
        where: { id },
        data: {
          description: description || existingId.description,
          date: date || existingId.date,
          transactionCategoryId: categoryId ? Number(categoryId) : existingId.transactionCategoryId,
          amount: newAmount,
          type: newType,
        }
      });
    });

    return NextResponse.json({ success: true, message: "Transaksi berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating journal:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (!id) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const entry = await prisma.generalTransaction.findUnique({
      where: { id }
    });

    if (!entry) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    if (entry.status === "void") {
      return NextResponse.json({ success: false, message: "Transaksi sudah di-void" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (entry.cashAccountId) {
        // 1. Revert balance
        if (entry.type === "in") {
          await tx.cashAccount.update({
            where: { id: entry.cashAccountId },
            data: { balance: { decrement: entry.amount } }
          });
        } else {
          await tx.cashAccount.update({
            where: { id: entry.cashAccountId },
            data: { balance: { increment: entry.amount } }
          });
        }
      }

      // 2. Delete entry
      await tx.generalTransaction.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true, message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
