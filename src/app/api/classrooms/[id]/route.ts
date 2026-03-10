import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

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

    const existing = await prisma.classroom.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ success: false, message: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.academicYearId !== undefined) data.academicYearId = body.academicYearId ? Number(body.academicYearId) : null;
    if (body.waliKelasId !== undefined) data.waliKelasId = body.waliKelasId ? Number(body.waliKelasId) : null;
    if (body.infaqNominal !== undefined) data.infaqNominal = Number(body.infaqNominal);

    const updated = await prisma.classroom.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, message: "Kelas berhasil diperbarui", data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal update kelas" }, { status: 500 });
  }
}
