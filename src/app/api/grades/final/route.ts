import { NextResponse } from "next/server";
import { db } from "@/db";
import { finalGrades, students, curriculums, subjects, gradeComponents, studentGrades } from "@/db/schema";
import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { hitungNilaiAkhir, hitungPredikat, generateDeskripsi } from "@/lib/grade-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");
    const curriculumId = searchParams.get("curriculumId");

    const filters = [];
    if (classroomId) filters.push(eq(finalGrades.classroomId, Number(classroomId)));
    if (subjectId) filters.push(eq(finalGrades.subjectId, Number(subjectId)));
    if (curriculumId) filters.push(eq(finalGrades.curriculumId, Number(curriculumId)));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const results = await db
      .select({
        id: finalGrades.id,
        nilaiPengetahuan: finalGrades.nilaiPengetahuan,
        nilaiKeterampilan: finalGrades.nilaiKeterampilan,
        nilaiAkhir: finalGrades.nilaiAkhir,
        predikat: finalGrades.predikat,
        deskripsi: finalGrades.deskripsi,
        isLocked: finalGrades.isLocked,
        studentId: finalGrades.studentId,
        student: {
            id: students.id,
            name: students.name,
            nis: students.nis,
            nisn: students.nisn
        }
      })
      .from(finalGrades)
      .leftJoin(students, eq(finalGrades.studentId, students.id))
      .where(whereClause)
      .orderBy(asc(students.name));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching final grades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { curriculumId, classroomId, subjectId } = body;

    if (!curriculumId || !classroomId || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ambil data kurikulum
    const [cur] = await db.select().from(curriculums).where(eq(curriculums.id, Number(curriculumId))).limit(1);
    if (!cur) {
      return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
    }

    // Ambil Mapel
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, Number(subjectId))).limit(1);

    // 1. Ambil Komponen dari kurikulum ini
    const components = await db.select().from(gradeComponents).where(eq(gradeComponents.curriculumId, Number(curriculumId)));

    const formatFormula = components.map(c => ({
      kode: c.code,
      bobot: c.bobot,
    }));

    // 2. Ambil nilai siswa di kelas & mapel tsb
    const grades = await db
      .select({
        id: studentGrades.id,
        studentId: studentGrades.studentId,
        nilaiAngka: studentGrades.nilaiAngka,
        componentId: studentGrades.componentId,
        componentCode: gradeComponents.code,
        studentName: students.name,
      })
      .from(studentGrades)
      .leftJoin(gradeComponents, eq(studentGrades.componentId, gradeComponents.id))
      .leftJoin(students, eq(studentGrades.studentId, students.id))
      .where(
        and(
          eq(studentGrades.classroomId, Number(classroomId)),
          eq(studentGrades.subjectId, Number(subjectId)),
          inArray(studentGrades.componentId, components.map(c => c.id))
        )
      );

    // Kelompokkan berdasarkan studentId
    const studentGradesMap: Record<number, any[]> = {};
    grades.forEach(g => {
      if (!g.studentId) return;
      if (!studentGradesMap[g.studentId]) studentGradesMap[g.studentId] = [];
      studentGradesMap[g.studentId].push(g);
    });

    // 3. Kalkulasi per siswa
    const valuesToInsert = [];
    for (const [sId, sGrades] of Object.entries(studentGradesMap)) {
      const studentId = Number(sId);
      const studentName = sGrades[0]?.studentName || "Siswa";

      const nilaiKomponenInput = sGrades.map((sg: any) => ({
        kode: sg.componentCode || "",
        nilai: sg.nilaiAngka,
      }));

      const finalScore = hitungNilaiAkhir(nilaiKomponenInput, formatFormula);
      const predikat = hitungPredikat(finalScore, cur.type as any);
      const deskripsi = generateDeskripsi(studentName, subject?.name || "", finalScore, predikat, cur.type as any);

      valuesToInsert.push({
        curriculumId: Number(curriculumId),
        studentId: studentId,
        subjectId: Number(subjectId),
        classroomId: Number(classroomId),
        nilaiPengetahuan: finalScore,
        nilaiKeterampilan: finalScore,
        nilaiAkhir: finalScore,
        predikat,
        deskripsi,
        isLocked: false,
      });
    }

    let results: any[] = [];
    if (valuesToInsert.length > 0) {
      results = await db
        .insert(finalGrades)
        .values(valuesToInsert)
        .onConflictDoUpdate({
          target: [
            finalGrades.curriculumId,
            finalGrades.studentId,
            finalGrades.subjectId,
          ],
          set: {
            classroomId: sql`EXCLUDED.classroom_id`,
            nilaiPengetahuan: sql`EXCLUDED.nilai_pengetahuan`,
            nilaiKeterampilan: sql`EXCLUDED.nilai_keterampilan`,
            nilaiAkhir: sql`EXCLUDED.nilai_akhir`,
            predikat: sql`EXCLUDED.predikat`,
            deskripsi: sql`EXCLUDED.deskripsi`,
            isLocked: sql`EXCLUDED.is_locked`,
            updatedAt: new Date(),
          },
        })
        .returning();
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Error calculating final grades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
