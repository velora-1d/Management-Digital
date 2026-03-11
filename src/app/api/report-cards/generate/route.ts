import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curId },
      include: { academicYear: true },
    });

    if (!curriculum) {
      return NextResponse.json({ error: "Kurikulum tidak ditemukan" }, { status: 404 });
    }

    // Ambil data kelas + wali kelas
    const classroom = await prisma.classroom.findUnique({
      where: { id: cId },
      include: { waliKelas: true },
    });

    // Ambil setting sekolah
    const settings = await prisma.schoolSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => { settingsMap[s.key] = s.value; });

    // Data per siswa
    const studentsData = [];

    for (const studentId of sIds) {
      // Identitas siswa
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true, name: true, nisn: true, nis: true, gender: true,
          birthPlace: true, birthDate: true,
          fatherName: true, motherName: true, guardianName: true,
          address: true,
        },
      });

      if (!student) continue;

      // Nilai akhir per mapel
      const finalGrades = await prisma.finalGrade.findMany({
        where: {
          studentId,
          classroomId: cId,
          curriculumId: curId,
        },
        include: {
          subject: { select: { id: true, name: true, code: true, type: true } },
        },
        orderBy: { subject: { name: "asc" } },
      });

      // Rekap absensi
      const attendances = await prisma.attendance.findMany({
        where: {
          studentId,
          classroomId: cId,
        },
      });

      const attendanceSummary = {
        sakit: attendances.filter((a) => a.status === "sakit").length,
        izin: attendances.filter((a) => a.status === "izin").length,
        alpha: attendances.filter((a) => a.status === "alpha").length,
      };

      // Ekstrakurikuler
      const extracurriculars = await prisma.extracurricularMember.findMany({
        where: { studentId },
        include: {
          extracurricular: { select: { name: true } },
        },
      });

      // Catatan wali kelas
      const teacherNote = await prisma.classTeacherNote.findFirst({
        where: {
          studentId,
          classroomId: cId,
          semester: semester || "ganjil",
        },
      });

      studentsData.push({
        student,
        finalGrades: finalGrades.map((fg) => ({
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
        extracurriculars: extracurriculars.map((e) => ({
          name: e.extracurricular?.name || "",
          score: e.score,
          predicate: e.predicate,
        })),
        teacherNote: teacherNote?.note || "",
      });

      // Update status report card ke GENERATED
      await prisma.reportCard.updateMany({
        where: {
          studentId,
          classroomId: cId,
          curriculumId: curId,
          semester: semester || "ganjil",
        },
        data: { status: "GENERATED" },
      });
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
    const message = error instanceof Error ? error.message : "Gagal generate data rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
