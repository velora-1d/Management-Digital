import { NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, users } from "@/db/schema";
import { and, eq, ilike, or, desc, sql } from "drizzle-orm";

// GET /api/announcements
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const target = searchParams.get("target");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(announcements.status, status));
    if (target && target !== "all") conditions.push(eq(announcements.target, target));
    if (search) {
      conditions.push(or(
        ilike(announcements.title, `%${search}%`),
        ilike(announcements.content, `%${search}%`)
      ));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalRes] = await Promise.all([
      db.select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        target: announcements.target,
        channel: announcements.channel,
        scheduledAt: announcements.scheduledAt,
        sentAt: announcements.sentAt,
        status: announcements.status,
        createdById: announcements.createdById,
        unitId: announcements.unitId,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        createdBy: {
          id: users.id,
          name: users.name
        }
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdById, users.id))
      .where(whereClause)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(skip),
      
      db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(announcements)
      .where(whereClause),
    ]);

    const total = totalRes[0].count;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat pengumuman";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/announcements
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, target, channel, scheduledAt, createdById } = body;

    if (!title) return NextResponse.json({ error: "Judul pengumuman wajib" }, { status: 400 });

    const isScheduled = scheduledAt && scheduledAt !== "";
    const [data] = await db.insert(announcements).values({
      title,
      content: content || "",
      target: target || "all",
      channel: channel || "dashboard",
      scheduledAt: scheduledAt || "",
      sentAt: isScheduled ? "" : new Date().toISOString(),
      status: isScheduled ? "scheduled" : "sent",
      createdById: createdById ? parseInt(createdById) : null,
    }).returning();
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat pengumuman";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
