import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * DELETE /api/infaq-bills/[id]
 * Hapus (soft-delete) tagihan infaq.
 * Hanya bisa hapus jika belum ada pembayaran.
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const billId = Number(params.id);

    if (isNaN(billId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const bill = await prisma.infaqBill.findUnique({
      where: { id: billId },
      include: { payments: { where: { deletedAt: null } } },
    });

    if (!bill || bill.deletedAt) {
      return NextResponse.json({ success: false, message: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    if (bill.payments.length > 0) {
      return NextResponse.json(
        { success: false, message: "Tidak bisa hapus tagihan yang sudah memiliki pembayaran. Void tagihan jika ingin membatalkan." },
        { status: 400 }
      );
    }

    await prisma.infaqBill.update({
      where: { id: billId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Tagihan berhasil dihapus." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus tagihan" }, { status: 500 });
  }
}

/**
 * PUT /api/infaq-bills/[id]
 * Edit nominal tagihan infaq.
 * Hanya bisa edit jika status belum_lunas.
 */
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const billId = Number(params.id);
    const body = await request.json();
    const { nominal } = body;

    if (isNaN(billId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    if (nominal === undefined || nominal === null) {
      return NextResponse.json({ success: false, message: "Nominal wajib diisi" }, { status: 400 });
    }

    const bill = await prisma.infaqBill.findUnique({ where: { id: billId } });
    if (!bill || bill.deletedAt) {
      return NextResponse.json({ success: false, message: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    if (bill.status === "lunas" || bill.status === "void") {
      return NextResponse.json(
        { success: false, message: "Tidak bisa edit tagihan yang sudah lunas atau void" },
        { status: 400 }
      );
    }

    await prisma.infaqBill.update({
      where: { id: billId },
      data: { nominal: Number(nominal) },
    });

    return NextResponse.json({
      success: true,
      message: `Nominal tagihan berhasil diubah ke Rp ${Number(nominal).toLocaleString("id-ID")}`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal edit tagihan" }, { status: 500 });
  }
}
