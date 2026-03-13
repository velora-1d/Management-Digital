import { NextResponse } from "next/server";
import { db } from "@/db";
import { letters } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/letters/[id]
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const body = await req.json();
    const [data] = await db
      .update(letters)
      .set({
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.sender !== undefined && { sender: body.sender }),
        ...(body.receiver !== undefined && { receiver: body.receiver }),
        ...(body.date !== undefined && { date: body.date }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.number !== undefined && { number: body.number }),
        ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
        updatedAt: new Date(),
      })
      .where(eq(letters.id, parseInt(id)))
      .returning();

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Letters PUT error:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengupdate surat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/letters/[id]
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    await db.delete(letters).where(eq(letters.id, parseInt(id)));
    return NextResponse.json({ message: "Surat berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Letters DELETE error:", error);
    const msg = error instanceof Error ? error.message : "Gagal menghapus surat";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
