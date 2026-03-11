import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/report-cards/notes?classroomId=X&semester=ganjil
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const semester = searchParams.get("semester") || "ganjil";

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId wajib diisi" }, { status: 400 });
    }

    const notes = await prisma.classTeacherNote.findMany({
      where: {
        classroomId: parseInt(classroomId),
        semester,
      },
      include: {
        student: { select: { id: true, name: true, nisn: true } },
        inputBy: { select: { id: true, name: true } },
      },
      orderBy: { student: { name: "asc" } },
    });

    return NextResponse.json(notes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memuat catatan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/report-cards/notes — Upsert catatan wali kelas (bulk)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { notes, classroomId, semester, inputById } = body;

    if (!notes?.length || !classroomId || !semester) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const results = await prisma.$transaction(
      notes.map((item: any) =>
        prisma.classTeacherNote.upsert({
          where: {
            unique_teacher_note: {
              studentId: parseInt(item.studentId),
              classroomId: parseInt(classroomId),
              semester,
            },
          },
          update: {
            note: item.note || "",
            inputById: inputById ? parseInt(inputById) : null,
          },
          create: {
            studentId: parseInt(item.studentId),
            classroomId: parseInt(classroomId),
            semester,
            note: item.note || "",
            inputById: inputById ? parseInt(inputById) : null,
          },
        })
      )
    );

    return NextResponse.json({ count: results.length, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan catatan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
