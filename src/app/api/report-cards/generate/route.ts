import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
    curriculums, 
    academicYears, 
    classrooms, 
    employees, 
    schoolSettings, 
    students, 
    finalGrades, 
    subjects, 
    attendances, 
    extracurricularMembers, 
    extracurriculars, 
    classTeacherNotes,
    reportCards
} from "@/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";

// POST /api/report-cards/generate — Generate data rapor lengkap per siswa
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentIds, classroomId, curriculumId, semester } = body;

    if (!studentIds?.length || !classroomId || !curriculumId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const cId = parseInt(classroomId);
    const curId = parseInt(curriculumId);
    const sIds = studentIds.map((s: string | number) => parseInt(String(s)));

    // Ambil data kurikulum
    const [curriculum] = await db
        .select({
            id: curriculums.id,
            type: curriculums.type,
            semester: curriculums.semester,
            academicYear: {
                id: academicYears.id,
                year: academicYears.year
            }
        })
        .from(curriculums)
        .leftJoin(academicYears, eq(curriculums.academicYearId, academicYears.id))
        .where(eq(curriculums.id, curId))
        .limit(1);

    if (!curriculum) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
    }

    // Ambil data kelas + wali kelas
    const [classroom] = await db
        .select({
            id: classrooms.id,
            name: classrooms.name,
            waliKelas: {
                id: employees.id,
                name: employees.name
            }
        })
        .from(classrooms)
        .leftJoin(employees, eq(classrooms.waliKelasId, employees.id))
        .where(eq(classrooms.id, cId))
        .limit(1);

    // Ambil setting sekolah
    const settings = await db.select().from(schoolSettings);
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    // Data per siswa
    const studentsData = [];

    for (const studentId of sIds) {
      // Identitas siswa
      const [student] = await db
        .select({
          id: students.id, name: students.name, nisn: students.nisn, nis: students.nis, gender: students.gender,
          birthPlace: students.birthPlace, birthDate: students.birthDate,
          fatherName: students.fatherName, motherName: students.motherName, guardianName: students.guardianName,
          address: students.address,
        })
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      if (!student) continue;

      // Nilai akhir per mapel
      const gradesRes = await db
        .select({
          nilaiPengetahuan: finalGrades.nilaiPengetahuan,
          nilaiKeterampilan: finalGrades.nilaiKeterampilan,
          nilaiAkhir: finalGrades.nilaiAkhir,
          predikat: finalGrades.predikat,
          deskripsi: finalGrades.deskripsi,
          subject: {
             id: subjects.id,
             name: subjects.name,
             code: subjects.code,
             type: subjects.type
          }
        })
        .from(finalGrades)
        .leftJoin(subjects, eq(finalGrades.subjectId, subjects.id))
        .where(
          and(
            eq(finalGrades.studentId, studentId),
            eq(finalGrades.classroomId, cId),
            eq(finalGrades.curriculumId, curId)
          )
        )
        .orderBy(asc(subjects.name));

      // Rekap absensi
      const atts = await db
        .select()
        .from(attendances)
        .where(
          and(
            eq(attendances.studentId, studentId),
            eq(attendances.classroomId, cId)
          )
        );

      const attendanceSummary = {
        sakit: atts.filter((a) => a.status === "sakit").length,
        izin: atts.filter((a) => a.status === "izin").length,
        alpha: atts.filter((a) => a.status === "alpha").length,
      };

      // Ekstrakurikuler
      const extras = await db
        .select({
          name: extracurriculars.name,
          score: extracurricularMembers.score,
          predicate: extracurricularMembers.predicate,
        })
        .from(extracurricularMembers)
        .leftJoin(extracurriculars, eq(extracurricularMembers.extracurricularId, extracurriculars.id))
        .where(eq(extracurricularMembers.studentId, studentId));

      // Catatan wali kelas
      const [teacherNote] = await db
        .select()
        .from(classTeacherNotes)
        .where(
          and(
            eq(classTeacherNotes.studentId, studentId),
            eq(classTeacherNotes.classroomId, cId),
            eq(classTeacherNotes.semester, semester || "ganjil")
          )
        )
        .limit(1);

      studentsData.push({
        student,
        finalGrades: gradesRes.map((fg) => ({
          subjectName: fg.subject?.name || "",
          subjectCode: fg.subject?.code || "",
          subjectType: fg.subject?.type || "",
          nilaiPengetahuan: fg.nilaiPengetahuan,
          nilaiKeterampilan: fg.nilaiKeterampilan,
          nilaiAkhir: fg.nilaiAkhir,
          predikat: fg.predikat,
          deskripsi: fg.deskripsi,
        })),
        attendanceSummary,
        extracurriculars: extras.map((e) => ({
          name: e.name || "",
          score: e.score,
          predicate: e.predicate,
        })),
        teacherNote: teacherNote?.note || "",
      });

      // Update status report card ke GENERATED
      await db
        .update(reportCards)
        .set({ status: "GENERATED", updatedAt: new Date() })
        .where(
          and(
            eq(reportCards.studentId, studentId),
            eq(reportCards.classroomId, cId),
            eq(reportCards.curriculumId, curId),
            eq(reportCards.semester, semester || "ganjil")
          )
        );
    }

    return NextResponse.json({
      school: settingsMap,
      curriculum: {
        type: curriculum.type,
        semester: curriculum.semester,
        academicYear: curriculum.academicYear?.year || "",
      },
      classroom: {
        name: classroom?.name || "",
        waliKelas: classroom?.waliKelas?.name || "",
      },
      students: studentsData,
    });
  } catch (error: unknown) {
    console.error("Report cards generate error:", error);
    const message = error instanceof Error ? error.message : "Gagal generate data rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
