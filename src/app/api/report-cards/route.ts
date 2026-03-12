import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/report-cards?classroomId=X&curriculumId=Y&semester=ganjil
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const curriculumId = searchParams.get("curriculumId");
    const semester = searchParams.get("semester");

    const where: Record<string, unknown> = {};
    if (classroomId) where.classroomId = parseInt(classroomId);
    if (curriculumId) where.curriculumId = parseInt(curriculumId);
    if (semester) where.semester = semester;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const [reportCards, total] = await Promise.all([
      prisma.reportCard.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, nisn: true, nis: true } },
          classroom: { select: { id: true, name: true } },
          curriculum: { select: { id: true, type: true, semester: true } },
        },
        orderBy: { student: { name: "asc" } },
        skip,
        take: limit,
      }),
      prisma.reportCard.count({ where }),
    ]);

    return NextResponse.json({
      data: reportCards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memuat data rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/report-cards — Upsert report card (DRAFT)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentIds, classroomId, curriculumId, semester } = body;

    if (!studentIds?.length || !classroomId || !curriculumId || !semester) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const results = [];
    for (const studentId of studentIds) {
      const record = await prisma.reportCard.upsert({
        where: {
          unique_report_card: {
            studentId: parseInt(studentId),
            curriculumId: parseInt(curriculumId),
            semester,
          },
        },
        update: {},
        create: {
          studentId: parseInt(studentId),
          classroomId: parseInt(classroomId),
          curriculumId: parseInt(curriculumId),
          semester,
          status: "DRAFT",
        },
      });
      results.push(record);
    }

    return NextResponse.json({ count: results.length, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal membuat rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
