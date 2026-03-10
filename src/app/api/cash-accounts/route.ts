import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/cash-accounts — List semua akun kas
 * POST /api/cash-accounts — Buat akun kas baru
 */
export async function GET() {
  try {
    const accounts = await prisma.cashAccount.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { transactions: { where: { deletedAt: null } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: accounts.map(a => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        transactionCount: a._count.transactions,
      })),
    });
  } catch (error) {
    console.error("Cash accounts GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data akun kas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama akun kas wajib diisi" },
        { status: 400 }
      );
    }

    // Cek duplikasi nama
    const existing = await prisma.cashAccount.findFirst({
      where: { name: name.trim(), deletedAt: null },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama akun kas sudah ada" },
        { status: 400 }
      );
    }

    const account = await prisma.cashAccount.create({
      data: {
        name: name.trim(),
        balance: 0,
        unitId: user.unitId || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Akun kas "${account.name}" berhasil dibuat`,
      data: { id: account.id, name: account.name, balance: account.balance },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Cash accounts POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat akun kas" },
      { status: 500 }
    );
  }
}
