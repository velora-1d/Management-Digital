import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/counseling/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data = await prisma.counselingRecord.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.followUp !== undefined && { followUp: body.followUp }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.date !== undefined && { date: body.date }),
        ...(body.counselorId !== undefined && { counselorId: body.counselorId ? parseInt(body.counselorId) : null }),
      },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate catatan BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/counseling/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.counselingRecord.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Catatan BK berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus catatan BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
