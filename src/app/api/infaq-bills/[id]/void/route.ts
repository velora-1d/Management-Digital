import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, infaqPayments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * POST /api/infaq-bills/[id]/void
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const billId = Number(params.id);

    if (isNaN(billId)) {
      return NextResponse.json({ success: false, message: "ID tagihan tidak valid" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      const [bill] = await tx.select().from(infaqBills).where(eq(infaqBills.id, billId)).limit(1);

      if (!bill) throw new Error("Tagihan tidak ditemukan");
      if (bill.deletedAt) throw new Error("Tagihan sudah dihapus");
      if (bill.status === "void") throw new Error("Tagihan sudah berstatus void");
      if (bill.status === "lunas") throw new Error("Tagihan yang sudah LUNAS tidak dapat dibatalkan (void).");

      const [{ paymentCount }] = await tx.select({ paymentCount: sql<number>`count(*)`.mapWith(Number) })
        .from(infaqPayments)
        .where(and(eq(infaqPayments.billId, billId), isNull(infaqPayments.deletedAt)));

      if (paymentCount > 0) {
        throw new Error("Tagihan ini memiliki riwayat pembayaran. Hapus pembayaran terlebih dahulu sebelum me-void tagihan.");
      }

      await tx.update(infaqBills).set({ status: "void" as any, updatedAt: new Date() }).where(eq(infaqBills.id, bill.id));
    });

    return NextResponse.json({ success: true, message: "Tagihan berhasil dibatalkan (void)." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal void tagihan";
    console.error("Void bill error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
