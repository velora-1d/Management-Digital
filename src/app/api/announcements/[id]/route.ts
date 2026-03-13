import { NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/announcements/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.target !== undefined) updateData.target = body.target;
    if (body.channel !== undefined) updateData.channel = body.channel;
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt;
    if (body.status !== undefined) updateData.status = body.status;
    
    updateData.updatedAt = new Date();

    const [data] = await db.update(announcements)
      .set(updateData)
      .where(eq(announcements.id, parseInt(id)))
      .returning();
      
    if (!data) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    }

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
    await db.delete(announcements).where(eq(announcements.id, parseInt(id)));
    return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus pengumuman";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
