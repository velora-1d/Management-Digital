import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentCredits } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/coop/credits/[id] — Bayar piutang (lunas/cicil)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paidAmount } = body;

    const [credit] = await db.select().from(studentCredits).where(eq(studentCredits.id, parseInt(id))).limit(1);
    
    if (!credit) return NextResponse.json({ success: false, message: "Piutang tidak ditemukan" }, { status: 404 });

    const newPaid = credit.paidAmount + parseFloat(paidAmount);
    const isLunas = newPaid >= credit.amount;

    const [updated] = await db.update(studentCredits)
      .set({
        paidAmount: newPaid,
        status: isLunas ? "lunas" : "cicil",
        updatedAt: new Date(),
      })
      .where(eq(studentCredits.id, parseInt(id)))
      .returning();
      
    return NextResponse.json({ success: true, message: "Pembayaran berhasil dicatat", data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memproses pembayaran";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
