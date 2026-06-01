
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactionCategories } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, ne, ilike } from "drizzle-orm";

/**
 * PATCH /api/transaction-categories/[id]
 */
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const [existing] = await db.select()
      .from(transactionCategories)
      .where(and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    // Cek duplikasi nama jika diubah
    if (body.name && body.name.trim() !== existing.name) {
      const [duplicate] = await db.select()
        .from(transactionCategories)
        .where(and(
          ilike(transactionCategories.name, body.name.trim()),
          ne(transactionCategories.id, id),
          isNull(transactionCategories.deletedAt)
        ))
        .limit(1);

      if (duplicate) {
        return NextResponse.json({ success: false, message: "Nama kategori sudah digunakan" }, { status: 400 });
      }
    }

    const [updated] = await db.update(transactionCategories)
      .set({
        name: body.name?.trim() || existing.name,
        type: body.type || existing.type,
        description: body.description || existing.description,
        unitId: body.unitId || existing.unitId,
        updatedAt: new Date(),
      })
      .where(eq(transactionCategories.id, id))
      .returning();

    return NextResponse.json({ success: true, message: "Kategori berhasil diperbarui", data: updated });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PATCH Transaction Category error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui kategori" }, { status: 500 });
  }
}

/**
 * DELETE /api/transaction-categories/[id]
 */
export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    await db.update(transactionCategories)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(transactionCategories.id, id));

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Transaction Category error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus kategori" }, { status: 500 });
  }
}

export const PUT = PATCH;
