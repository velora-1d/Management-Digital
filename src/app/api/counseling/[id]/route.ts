import { NextResponse } from "next/server";
import { db } from "@/db";
import { counselingRecords } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/counseling/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.followUp !== undefined) updateData.followUp = body.followUp;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.counselorId !== undefined) updateData.counselorId = body.counselorId ? parseInt(body.counselorId) : null;
    
    updateData.updatedAt = new Date();

    const [data] = await db.update(counselingRecords)
      .set(updateData)
      .where(eq(counselingRecords.id, parseInt(id)))
      .returning();
      
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
    await db.delete(counselingRecords)
      .where(eq(counselingRecords.id, parseInt(id)));
      
    return NextResponse.json({ message: "Catatan BK berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus catatan BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
