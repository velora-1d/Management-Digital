import { NextResponse } from "next/server";
import { db } from "@/db";
import { classTeacherNotes, students, employees } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/report-cards/notes?classroomId=X&semester=ganjil
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const semester = searchParams.get("semester") || "ganjil";

    if (!classroomId) {
      return NextResponse.json({ error: "classroomId wajib diisi" }, { status: 400 });
    }

    const results = await db
      .select({
        id: classTeacherNotes.id,
        note: classTeacherNotes.note,
        semester: classTeacherNotes.semester,
        studentId: classTeacherNotes.studentId,
        student: {
            id: students.id,
            name: students.name,
            nisn: students.nisn
        },
        inputBy: {
            id: employees.id,
            name: employees.name
        }
      })
      .from(classTeacherNotes)
      .leftJoin(students, eq(classTeacherNotes.studentId, students.id))
      .leftJoin(employees, eq(classTeacherNotes.inputById, employees.id))
      .where(
        and(
          eq(classTeacherNotes.classroomId, parseInt(classroomId)),
          eq(classTeacherNotes.semester, semester)
        )
      )
      .orderBy(asc(students.name));

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("Report cards notes GET error:", error);
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

    const results = [];
    for (const item of notes) {
        // Upsert manual with Drizzle
        const [existing] = await db
            .select()
            .from(classTeacherNotes)
            .where(
                and(
                    eq(classTeacherNotes.studentId, parseInt(item.studentId)),
                    eq(classTeacherNotes.classroomId, parseInt(classroomId)),
                    eq(classTeacherNotes.semester, semester)
                )
            )
            .limit(1);

        if (existing) {
            const [updated] = await db
                .update(classTeacherNotes)
                .set({
                    note: item.note || "",
                    inputById: inputById ? parseInt(inputById) : null,
                    updatedAt: new Date(),
                })
                .where(eq(classTeacherNotes.id, existing.id))
                .returning();
            results.push(updated);
        } else {
            const [created] = await db
                .insert(classTeacherNotes)
                .values({
                    studentId: parseInt(item.studentId),
                    classroomId: parseInt(classroomId),
                    semester,
                    note: item.note || "",
                    inputById: inputById ? parseInt(inputById) : null,
                })
                .returning();
            results.push(created);
        }
    }

    return NextResponse.json({ count: results.length, data: results });
  } catch (error: unknown) {
    console.error("Report cards notes POST error:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan catatan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
