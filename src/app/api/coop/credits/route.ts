import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coop/credits?status=belum_lunas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total, allCreditsForTotal] = await Promise.all([
      prisma.studentCredit.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, nis: true } },
          transaction: { select: { id: true, date: true, total: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.studentCredit.count({ where }),
      prisma.studentCredit.findMany({
        where: { ...where, status: { not: "lunas" } },
        select: { amount: true, paidAmount: true },
      }),
    ]);

    // Hitung total piutang aktif dari seluruh data yang belum lunas
    const totalPiutang = allCreditsForTotal.reduce(
      (sum, d) => sum + (d.amount - d.paidAmount),
      0
    );

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPiutang,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat piutang";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
