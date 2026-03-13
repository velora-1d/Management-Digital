import { NextResponse } from "next/server";
import { db } from "@/db";
import { classrooms } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq } from "drizzle-orm";

/**
 * PUT /api/classrooms/[id]
 * Update data kelas — termasuk infaqNominal untuk setting nominal SPP/Infaq per kelas.
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

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.academicYearId !== undefined) updateData.academicYearId = body.academicYearId ? Number(body.academicYearId) : null;
    if (body.waliKelasId !== undefined) updateData.waliKelasId = body.waliKelasId ? Number(body.waliKelasId) : null;
    if (body.infaqNominal !== undefined) updateData.infaqNominal = Number(body.infaqNominal);

    updateData.updatedAt = new Date();

    const [updated] = await db.update(classrooms)
      .set(updateData)
      .where(eq(classrooms.id, id))
      .returning();

    return NextResponse.json({ success: true, message: "Kelas berhasil diperbarui", data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal update kelas" }, { status: 500 });
  }
}
