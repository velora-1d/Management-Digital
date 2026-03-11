import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/announcements/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.target !== undefined && { target: body.target }),
        ...(body.channel !== undefined && { channel: body.channel }),
        ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate pengumuman";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus pengumuman";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
