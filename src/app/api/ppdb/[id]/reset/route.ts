import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, registrationPayments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const [reg] = await db.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
    if (!reg || reg.deletedAt) return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    if (reg.status === "menunggu" || reg.status === "pending") return NextResponse.json({ success: false, message: "Status sudah menunggu" }, { status: 400 });
    if (reg.status === "converted") return NextResponse.json({ success: false, message: "Tidak bisa reset pendaftar yang sudah dikonversi ke siswa" }, { status: 400 });

    await db.transaction(async (tx) => {
      const paidItems = await tx.select({ id: registrationPayments.id }).from(registrationPayments)
        .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.payableId, regId), eq(registrationPayments.isPaid, true), isNull(registrationPayments.deletedAt)));

      if (paidItems.length > 0) {
        throw new Error("Penerimaan tak bisa dibatalkan karena ada tagihan biaya yang sudah lunas.");
      }

      await tx.delete(registrationPayments)
        .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.payableId, regId), eq(registrationPayments.isPaid, false)));

      await tx.update(ppdbRegistrations).set({ status: "menunggu" as any, updatedAt: new Date() }).where(eq(ppdbRegistrations.id, regId));
    });

    return NextResponse.json({ success: true, message: `${reg.name} direset ke status menunggu.` });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    const msg = error instanceof Error ? error.message : "Gagal reset pendaftar";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
