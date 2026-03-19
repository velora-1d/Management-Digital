import { NextResponse } from "next/server";
import { db } from "@/db";
import { extracurricularMembers, students, classrooms, extracurriculars } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

// GET /api/extracurricular/members?extracurricularId=X
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const extracurricularId = searchParams.get("extracurricularId");

    let whereClause = undefined;
    if (extracurricularId) whereClause = eq(extracurricularMembers.extracurricularId, parseInt(extracurricularId));

    const result = await db
      .select({
        id: extracurricularMembers.id,
        score: extracurricularMembers.score,
        predicate: extracurricularMembers.predicate,
        student: {
          id: students.id,
          name: students.name,
          nisn: students.nisn,
          classroomId: students.classroomId,
          classroomName: classrooms.name
        },
        extracurricular: {
          id: extracurriculars.id,
          name: extracurriculars.name
        }
      })
      .from(extracurricularMembers)
      .leftJoin(students, eq(extracurricularMembers.studentId, students.id))
      .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
      .leftJoin(extracurriculars, eq(extracurricularMembers.extracurricularId, extracurriculars.id))
      .where(whereClause)
      .orderBy(asc(students.name));

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Extracurricular members GET error:", error);
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
      if (studentIds.length > 0) {
        const valuesToInsert = studentIds.map((studentId: string | number) => ({
          extracurricularId: parseInt(extracurricularId),
          studentId: typeof studentId === "string" ? parseInt(studentId) : studentId,
        }));

        await db
          .insert(extracurricularMembers)
          .values(valuesToInsert)
          .onConflictDoNothing({
            target: [
              extracurricularMembers.extracurricularId,
              extracurricularMembers.studentId,
            ],
          });
      }
      return NextResponse.json({ count: studentIds.length });
    }

    // Update nilai/predikat per anggota
    if (updates?.length) {
      for (const u of updates) {
        await db
          .update(extracurricularMembers)
          .set({
            ...(u.score !== undefined && { score: parseFloat(u.score) }),
            ...(u.predicate !== undefined && { predicate: u.predicate }),
            updatedAt: new Date(),
          })
          .where(eq(extracurricularMembers.id, parseInt(u.id)));
      }
      return NextResponse.json({ count: updates.length });
    }

    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Extracurricular members POST error:", error);
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

    await db.delete(extracurricularMembers).where(eq(extracurricularMembers.id, parseInt(id)));
    return NextResponse.json({ message: "Anggota dihapus" });
  } catch (error: unknown) {
    console.error("Extracurricular members DELETE error:", error);
    const msg = error instanceof Error ? error.message : "Gagal menghapus anggota";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
