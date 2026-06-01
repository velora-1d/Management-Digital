import { NextResponse } from "next/server";
import { db } from "@/db";
import { classrooms } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, ne, ilike, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * PUT /api/classrooms/[id]
 */
export async function PUT(
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
      .from(classrooms)
      .where(eq(classrooms.id, id))
      .limit(1);

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ success: false, message: "Kelas tidak ditemukan" }, { status: 404 });
    }

    // Pengecekan Duplikasi Nama (jika nama diubah)
    if (body.name && body.name !== existing.name) {
      const [duplicate] = await db.select()
        .from(classrooms)
        .where(
          and(
            ilike(classrooms.name, body.name),
            ne(classrooms.id, id),
            isNull(classrooms.deletedAt)
          )
        )
        .limit(1);

      if (duplicate) {
        return NextResponse.json({ 
          success: false, 
          message: `Nama kelas "${body.name}" sudah digunakan oleh kelas lain yang aktif.` 
        }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.level !== undefined) updateData.level = Number(body.level);
    if (body.academicYearId !== undefined) updateData.academicYearId = body.academicYearId ? Number(body.academicYearId) : null;
    if (body.waliKelasId !== undefined) updateData.waliKelasId = body.waliKelasId ? Number(body.waliKelasId) : null;
    if (body.infaqNominal !== undefined) updateData.infaqNominal = Number(body.infaqNominal);

    updateData.updatedAt = new Date();

    const [updated] = await db.update(classrooms)
      .set(updateData as Partial<typeof classrooms.$inferInsert>)
      .where(eq(classrooms.id, id))
      .returning();

    // Revalidasi cache
    revalidatePath("/classrooms");
    revalidatePath("/students");
    revalidatePath("/infaq-bills");

    return NextResponse.json({ success: true, message: "Kelas berhasil diperbarui", data: updated });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT Classroom error:", error);
    const message = error instanceof Error ? error.message : "Gagal update kelas";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

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

    await db.update(classrooms)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(classrooms.id, id));

    return NextResponse.json({ success: true, message: "Kelas berhasil dihapus" });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("DELETE Classroom error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus kelas";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export const PATCH = PUT;
