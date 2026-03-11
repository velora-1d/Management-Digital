import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/counseling?studentId=X&category=X&status=X
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = parseInt(studentId);
    if (category) where.category = category;
    if (status) where.status = status;

    const data = await prisma.counselingRecord.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nisn: true, classroom: { select: { name: true } } } },
        counselor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat data BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/counseling
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, counselorId, date, category, description, followUp, status } = body;

    if (!studentId || !category) {
      return NextResponse.json({ error: "Siswa dan kategori wajib diisi" }, { status: 400 });
    }

    const data = await prisma.counselingRecord.create({
      data: {
        studentId: parseInt(studentId),
        counselorId: counselorId ? parseInt(counselorId) : null,
        date: date || new Date().toISOString().split("T")[0],
        category,
        description: description || "",
        followUp: followUp || "",
        status: status || "aktif",
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah catatan BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
