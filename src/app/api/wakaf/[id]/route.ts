import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * PUT /api/wakaf/[id] — Edit transaksi wakaf
 * DELETE /api/wakaf/[id] — Hapus transaksi wakaf + revert saldo kas
 */

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { amount, description, date, wakafDonorId, wakafPurposeId } = body;

    const tx = await prisma.generalTransaction.findUnique({ where: { id } });
    if (!tx || tx.deletedAt) {
      return NextResponse.json({ success: false, message: "Transaksi tidak ditemukan" }, { status: 404 });
    }
    if (tx.status === "void") {
      return NextResponse.json({ success: false, message: "Tidak bisa edit transaksi yang sudah void" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prismaClient) => {
      // Jika nominal berubah, update saldo kas
      const oldAmount = tx.amount;
      const newAmount = amount !== undefined ? Number(amount) : oldAmount;

      if (tx.cashAccountId && newAmount !== oldAmount) {
        const diff = newAmount - oldAmount;
        await prismaClient.cashAccount.update({
          where: { id: tx.cashAccountId },
          data: { balance: { increment: diff } },
        });
      }

      return await prismaClient.generalTransaction.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(description !== undefined && { description }),
          ...(date !== undefined && { date }),
          ...(wakafDonorId !== undefined && { wakafDonorId: wakafDonorId ? Number(wakafDonorId) : null }),
          ...(wakafPurposeId !== undefined && { wakafPurposeId: wakafPurposeId ? Number(wakafPurposeId) : null }),
        },
      });
    });

    return NextResponse.json({ success: true, message: "Transaksi wakaf berhasil diupdate.", data: result });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal update transaksi" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.generalTransaction.findUnique({ where: { id } });
      if (!entry || entry.deletedAt) throw new Error("Transaksi tidak ditemukan");
      if (entry.status === "void") throw new Error("Transaksi sudah void");

      // Void dan soft delete
      await tx.generalTransaction.update({
        where: { id },
        data: { status: "void", deletedAt: new Date() },
      });

      // Revert saldo kas
      if (entry.cashAccountId) {
        const revertAmount = entry.type === "in" ? -entry.amount : entry.amount;
        await tx.cashAccount.update({
          where: { id: entry.cashAccountId },
          data: { balance: { increment: revertAmount } },
        });
      }

      return { amount: entry.amount };
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi wakaf Rp ${result.amount.toLocaleString("id-ID")} berhasil dihapus.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal hapus transaksi";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
