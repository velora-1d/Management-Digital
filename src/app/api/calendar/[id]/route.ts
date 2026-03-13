import { NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/calendar/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.dateStart !== undefined) updateData.dateStart = body.dateStart;
    if (body.dateEnd !== undefined) updateData.dateEnd = body.dateEnd;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.academicYearId !== undefined) updateData.academicYearId = body.academicYearId ? parseInt(body.academicYearId) : null;
    
    updateData.updatedAt = new Date();

    const [data] = await db.update(calendarEvents)
      .set(updateData)
      .where(eq(calendarEvents.id, parseInt(id)))
      .returning();

    if (!data) {
      return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/calendar/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(calendarEvents).where(eq(calendarEvents.id, parseInt(id)));
    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
