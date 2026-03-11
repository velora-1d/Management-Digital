import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/extracurricular/members?extracurricularId=X
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const extracurricularId = searchParams.get("extracurricularId");

    const where: Record<string, unknown> = {};
    if (extracurricularId) where.extracurricularId = parseInt(extracurricularId);

    const data = await prisma.extracurricularMember.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nisn: true, classroomId: true, classroom: { select: { name: true } } } },
        extracurricular: { select: { id: true, name: true } },
      },
      orderBy: { student: { name: "asc" } },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat anggota";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/extracurricular/members — Assign/update anggota
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { extracurricularId, studentIds, updates } = body;

    // Bulk assign
    if (extracurricularId && studentIds?.length) {
      const results = [];
      for (const studentId of studentIds) {
        const record = await prisma.extracurricularMember.upsert({
          where: {
            unique_member: {
              extracurricularId: parseInt(extracurricularId),
              studentId: parseInt(studentId),
            },
          },
          update: {},
          create: {
            extracurricularId: parseInt(extracurricularId),
            studentId: parseInt(studentId),
          },
        });
        results.push(record);
      }
      return NextResponse.json({ count: results.length });
    }

    // Update nilai/predikat per anggota
    if (updates?.length) {
      for (const u of updates) {
        await prisma.extracurricularMember.update({
          where: { id: parseInt(u.id) },
          data: {
            ...(u.score !== undefined && { score: parseFloat(u.score) }),
            ...(u.predicate !== undefined && { predicate: u.predicate }),
          },
        });
      }
      return NextResponse.json({ count: updates.length });
    }

    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengelola anggota";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/extracurricular/members?id=X
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

    await prisma.extracurricularMember.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: "Anggota dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus anggota";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
