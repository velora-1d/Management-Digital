import { NextResponse } from "next/server";
import { db } from "@/db";
import { wakafPurposes, generalTransactions } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql, asc } from "drizzle-orm";

/**
 * GET /api/wakaf/purposes — List tujuan wakaf
 */
export async function GET() {
  try {
    await requireAuth();
    const purposes = await db
      .select()
      .from(wakafPurposes)
      .where(isNull(wakafPurposes.deletedAt))
      .orderBy(asc(wakafPurposes.name));
    
    return NextResponse.json({ success: true, data: purposes });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat tujuan wakaf" }, { status: 500 });
  }
}

/**
 * POST /api/wakaf/purposes — Tambah tujuan wakaf
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama tujuan wajib diisi" }, { status: 400 });
    }

    const [purpose] = await db
      .insert(wakafPurposes)
      .values({
        name: name.trim(),
        description: description || "",
        unitId: user.unitId || "",
      })
      .returning();

    return NextResponse.json({ success: true, message: "Tujuan wakaf berhasil ditambahkan.", data: purpose });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menambah tujuan" }, { status: 500 });
  }
}

/**
 * DELETE /api/wakaf/purposes — Hapus tujuan wakaf (body: { id })
 */
export async function DELETE(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID wajib diisi" }, { status: 400 });
    }

    const purposeId = Number(id);

    // Cek apakah masih dipakai
    const [usedResult] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(generalTransactions)
      .where(
        and(
          eq(generalTransactions.wakafPurposeId, purposeId),
          isNull(generalTransactions.deletedAt)
        )
      );

    const used = usedResult?.count || 0;

    if (used > 0) {
      return NextResponse.json({
        success: false,
        message: `Tujuan ini masih digunakan oleh ${used} transaksi. Tidak bisa dihapus.`,
      }, { status: 400 });
    }

    await db
      .update(wakafPurposes)
      .set({ deletedAt: new Date() })
      .where(eq(wakafPurposes.id, purposeId));

    return NextResponse.json({ success: true, message: "Tujuan wakaf berhasil dihapus." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus tujuan" }, { status: 500 });
  }
}
