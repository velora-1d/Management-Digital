import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq } from "drizzle-orm";

/**
 * POST /api/infaq-bills/[id]/revert
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
      if (bill.status !== "lunas") throw new Error("Hanya tagihan berstatus LUNAS yang bisa di-revert.");

      await tx.update(infaqBills).set({ status: "belum_lunas" as any, updatedAt: new Date() }).where(eq(infaqBills.id, bill.id));
    });

    return NextResponse.json({ success: true, message: "Status tagihan berhasil dikembalikan ke Belum Lunas." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal revert tagihan";
    console.error("Revert bill error:", error);
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
