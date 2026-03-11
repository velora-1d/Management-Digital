import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/extracurricular/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, employeeId, schedule, status } = body;

    const data = await prisma.extracurricular.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(employeeId !== undefined && { employeeId: employeeId ? parseInt(employeeId) : null }),
        ...(schedule !== undefined && { schedule }),
        ...(status !== undefined && { status }),
      },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/extracurricular/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.extracurricular.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ message: "Ekskul berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
