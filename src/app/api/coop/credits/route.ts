import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coop/credits?status=belum_lunas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const data = await prisma.studentCredit.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nis: true } },
        transaction: { select: { id: true, date: true, total: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Hitung total piutang aktif
    const totalPiutang = data
      .filter(d => d.status !== "lunas")
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

    return NextResponse.json({ credits: data, totalPiutang });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat piutang";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
