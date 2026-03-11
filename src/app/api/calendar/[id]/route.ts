import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/calendar/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data = await prisma.calendarEvent.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.dateStart !== undefined && { dateStart: body.dateStart }),
        ...(body.dateEnd !== undefined && { dateEnd: body.dateEnd }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.academicYearId !== undefined && { academicYearId: body.academicYearId ? parseInt(body.academicYearId) : null }),
      },
    });
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
    await prisma.calendarEvent.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
