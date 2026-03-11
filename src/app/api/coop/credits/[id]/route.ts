import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/coop/credits/[id] — Bayar piutang (lunas/cicil)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paidAmount } = body;

    const credit = await prisma.studentCredit.findUnique({ where: { id: parseInt(id) } });
    if (!credit) return NextResponse.json({ error: "Piutang tidak ditemukan" }, { status: 404 });

    const newPaid = credit.paidAmount + parseFloat(paidAmount);
    const isLunas = newPaid >= credit.amount;

    const updated = await prisma.studentCredit.update({
      where: { id: parseInt(id) },
      data: {
        paidAmount: newPaid,
        status: isLunas ? "lunas" : "cicil",
      },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memproses pembayaran";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
