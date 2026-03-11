import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/calendar?type=X&academicYearId=X
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const academicYearId = searchParams.get("academicYearId");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (academicYearId) where.academicYearId = parseInt(academicYearId);

    const data = await prisma.calendarEvent.findMany({
      where,
      include: { academicYear: { select: { id: true, year: true } } },
      orderBy: { dateStart: "asc" },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat kalender";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/calendar
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, dateStart, dateEnd, type, color, academicYearId } = body;

    if (!title || !dateStart) {
      return NextResponse.json({ error: "Judul dan tanggal mulai wajib" }, { status: 400 });
    }

    const data = await prisma.calendarEvent.create({
      data: {
        title,
        dateStart,
        dateEnd: dateEnd || dateStart,
        type: type || "kegiatan",
        color: color || "#3b82f6",
        academicYearId: academicYearId ? parseInt(academicYearId) : null,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
