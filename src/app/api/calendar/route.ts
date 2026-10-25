import { NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents, academicYears } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/calendar?type=X&academicYearId=X
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const academicYearId = searchParams.get("academicYearId");

    const conditions = [];
    if (type) conditions.push(eq(calendarEvents.type, type));
    if (academicYearId) conditions.push(eq(calendarEvents.academicYearId, parseInt(academicYearId)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      dateStart: calendarEvents.dateStart,
      dateEnd: calendarEvents.dateEnd,
      type: calendarEvents.type,
      color: calendarEvents.color,
      academicYearId: calendarEvents.academicYearId,
      unitId: calendarEvents.unitId,
      createdAt: calendarEvents.createdAt,
      updatedAt: calendarEvents.updatedAt,
      academicYear: {
        id: academicYears.id,
        year: academicYears.year,
      }
    })
    .from(calendarEvents)
    .leftJoin(academicYears, eq(calendarEvents.academicYearId, academicYears.id))
    .where(whereClause)
    .orderBy(asc(calendarEvents.dateStart));
    
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

    const [data] = await db.insert(calendarEvents).values({
      title,
      dateStart,
      dateEnd: dateEnd || dateStart,
      type: type || "kegiatan",
      color: color || "#3b82f6",
      academicYearId: academicYearId ? parseInt(academicYearId) : null,
    }).returning();
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
