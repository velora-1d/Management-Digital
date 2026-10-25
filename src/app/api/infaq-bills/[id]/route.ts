import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, infaqPayments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * DELETE /api/infaq-bills/[id]
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

    const [bill] = await db.select().from(infaqBills).where(eq(infaqBills.id, billId)).limit(1);

    if (!bill || bill.deletedAt) {
      return NextResponse.json({ success: false, message: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    // Check if has payments
    const [{ paymentCount }] = await db.select({ paymentCount: sql<number>`count(*)`.mapWith(Number) })
      .from(infaqPayments)
      .where(and(eq(infaqPayments.billId, billId), isNull(infaqPayments.deletedAt)));

    if (paymentCount > 0) {
      return NextResponse.json(
        { success: false, message: "Tidak bisa hapus tagihan yang sudah memiliki pembayaran. Void tagihan jika ingin membatalkan." },
        { status: 400 }
      );
    }

    await db.update(infaqBills).set({ deletedAt: new Date() }).where(eq(infaqBills.id, billId));

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

    const [bill] = await db.select().from(infaqBills).where(eq(infaqBills.id, billId)).limit(1);
    if (!bill || bill.deletedAt) {
      return NextResponse.json({ success: false, message: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    if (bill.status === "lunas" || bill.status === "void") {
      return NextResponse.json(
        { success: false, message: "Tidak bisa edit tagihan yang sudah lunas atau void" },
        { status: 400 }
      );
    }

    await db.update(infaqBills).set({ nominal: Number(nominal), updatedAt: new Date() }).where(eq(infaqBills.id, billId));

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
