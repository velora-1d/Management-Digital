import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { hitungNilaiAkhir, hitungPredikat, generateDeskripsi } from "@/lib/grade-engine";

export async function GET(req: Request) {
  try {
    const headersList = await headers();

    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");
    const curriculumId = searchParams.get("curriculumId");

    const where: any = {};
    if (classroomId) where.classroomId = Number(classroomId);
    if (subjectId) where.subjectId = Number(subjectId);
    if (curriculumId) where.curriculumId = Number(curriculumId);

    const finalGrades = await prisma.finalGrade.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: {
        student: { name: 'asc' },
      },
    });

    return NextResponse.json(finalGrades);
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
    const headersList = await headers();

    const body = await req.json();
    const { curriculumId, classroomId, subjectId } = body;

    if (!curriculumId || !classroomId || !subjectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ambil data kurikulum untuk tahu tipenya
    const cur = await prisma.curriculum.findUnique({ where: { id: Number(curriculumId) } });
    if (!cur) {
      return NextResponse.json({ error: "Curriculum not found" }, { status: 404 });
    }

    // Ambil Mapel
    const subject = await prisma.subject.findUnique({ where: { id: Number(subjectId) } });

    // 1. Ambil Formula dari tabel GradeFormula (atau kita pakai semua komponen terdaftar)
    const components = await prisma.gradeComponent.findMany({
      where: { curriculumId: Number(curriculumId) },
    });

    const totalBobot = components.reduce((acc: number, c: any) => acc + c.bobot, 0);
    const formatFormula = components.map(c => ({
      kode: c.code,
      bobot: c.bobot,
    }));

    // 2. Ambil nilai siswa di kelas & mapel tsb
    const grades = await prisma.studentGrade.findMany({
      where: {
        classroomId: Number(classroomId),
        subjectId: Number(subjectId),
        componentId: { in: components.map(c => c.id) },
      },
      include: {
        component: true,
        student: true, // untuk ambil nama untuk generate deskripsi
      },
    });

    // Kelompokkan berdasarkan studentId
    const studentGradesMap: Record<number, any[]> = {};
    grades.forEach(g => {
      if (!g.studentId) return;
      if (!studentGradesMap[g.studentId]) studentGradesMap[g.studentId] = [];
      studentGradesMap[g.studentId].push(g);
    });

    // 3. Kalkulasi per siswa
    const promises = [];
    for (const [sId, sGrades] of Object.entries(studentGradesMap)) {
      const studentId = Number(sId);
      const studentName = sGrades[0]?.student?.name || "Siswa";

      // Pisahkan pengetahuan dan keterampilan jika nanti perlu,
      // saat ini gabung jadi nilai akhir
      const nilaiKomponenInput = sGrades.map((sg: any) => ({
        kode: sg.component?.code || "",
        nilai: sg.nilaiAngka,
      }));

      const finalScore = hitungNilaiAkhir(nilaiKomponenInput, formatFormula);
      const predikat = hitungPredikat(finalScore, cur.type as any);
      const deskripsi = generateDeskripsi(studentName, subject?.name || "", finalScore, predikat, cur.type as any);

      promises.push(
        prisma.finalGrade.upsert({
          where: {
            unique_final_grade: {
              curriculumId: Number(curriculumId),
              studentId: studentId,
              subjectId: Number(subjectId),
            },
          },
          update: {
            classroomId: Number(classroomId),
            nilaiPengetahuan: finalScore,
            nilaiKeterampilan: finalScore, // Asumsi merged
            nilaiAkhir: finalScore,
            predikat,
            deskripsi,
            isLocked: false,
          },
          create: {
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
          },
        })
      );
    }

    const results = await Promise.all(promises);

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("Error calculating final grades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
