import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/letters/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await prisma.letter.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.sender !== undefined && { sender: body.sender }),
        ...(body.receiver !== undefined && { receiver: body.receiver }),
        ...(body.date !== undefined && { date: body.date }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.number !== undefined && { number: body.number }),
        ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
      },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate surat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/letters/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.letter.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Surat berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus surat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
