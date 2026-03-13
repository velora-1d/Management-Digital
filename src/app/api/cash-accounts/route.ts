import { NextResponse } from "next/server";
import { db } from "@/db";
import { cashAccounts, generalTransactions } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, isNull, asc, and, sql } from "drizzle-orm";

/**
 * GET /api/cash-accounts — List semua akun kas
 * POST /api/cash-accounts — Buat akun kas baru
 */
export async function GET() {
  try {
    const records = await db.select({
      id: cashAccounts.id,
      name: cashAccounts.name,
      balance: cashAccounts.balance,
      transactionCount: sql<number>`count(${generalTransactions.id})`.mapWith(Number),
    })
    .from(cashAccounts)
    .leftJoin(generalTransactions, and(
      eq(cashAccounts.id, generalTransactions.cashAccountId),
      isNull(generalTransactions.deletedAt)
    ))
    .where(isNull(cashAccounts.deletedAt))
    .groupBy(cashAccounts.id)
    .orderBy(asc(cashAccounts.name));

    return NextResponse.json({
      success: true,
      data: records,
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
    const [existing] = await db.select()
      .from(cashAccounts)
      .where(and(eq(cashAccounts.name, name.trim()), isNull(cashAccounts.deletedAt)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama akun kas sudah ada" },
        { status: 400 }
      );
    }

    const [account] = await db.insert(cashAccounts).values({
      name: name.trim(),
      balance: 0,
      unitId: user.unitId || "",
    }).returning();

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
