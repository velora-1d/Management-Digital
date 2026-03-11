import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/announcements
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const data = await prisma.announcement.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
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
    const data = await prisma.announcement.create({
      data: {
        title,
        content: content || "",
        target: target || "all",
        channel: channel || "dashboard",
        scheduledAt: scheduledAt || "",
        sentAt: isScheduled ? "" : new Date().toISOString(),
        status: isScheduled ? "scheduled" : "sent",
        createdById: createdById ? parseInt(createdById) : null,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat pengumuman";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
