import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, studentEnrollments, students, classrooms, academicYears } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, inArray, sql } from "drizzle-orm";

const SEMESTER_1_MONTHS = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const SEMESTER_2_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
const FULL_YEAR_MONTHS = [...SEMESTER_1_MONTHS, ...SEMESTER_2_MONTHS];

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { period, months, semester, year, classroomId, academicYearId } = body;

    // 1. Resolve bulan berdasarkan period
    const resolvedPeriod = period || "bulanan";
    let resolvedMonths: string[] = [];

    if (resolvedPeriod === "tahunan") {
      resolvedMonths = [...FULL_YEAR_MONTHS];
    } else if (resolvedPeriod === "semester") {
      const sem = Number(semester);
      if (sem === 1) resolvedMonths = [...SEMESTER_1_MONTHS];
      else if (sem === 2) resolvedMonths = [...SEMESTER_2_MONTHS];
      else return NextResponse.json({ success: false, message: "Semester harus 1 atau 2" }, { status: 400 });
    } else {
      if (!months || !Array.isArray(months) || months.length === 0) {
        return NextResponse.json({ success: false, message: "Bulan wajib diisi (array, minimal 1)" }, { status: 400 });
      }
      resolvedMonths = months.map(String);
    }

    if (!year) {
      return NextResponse.json({ success: false, message: "Tahun wajib diisi" }, { status: 400 });
    }

    // 2. Resolve tahun ajaran
    let resolvedAcademicYearId: number | null = academicYearId ? Number(academicYearId) : null;
    if (!resolvedAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      resolvedAcademicYearId = activeYear?.id || null;
    }

    if (!resolvedAcademicYearId) {
      return NextResponse.json({ success: false, message: "Tahun ajaran wajib dipilih atau harus ada tahun ajaran aktif" }, { status: 400 });
    }

    // 3. Query siswa via StudentEnrollment
    const enrollmentConditions = [isNull(studentEnrollments.deletedAt), eq(studentEnrollments.academicYearId, resolvedAcademicYearId)];
    if (classroomId) enrollmentConditions.push(eq(studentEnrollments.classroomId, Number(classroomId)));

    const enrollments = await db.select({
      studentId: studentEnrollments.studentId,
      classroomId: studentEnrollments.classroomId,
      studentName: students.name,
      studentCategory: students.category,
      studentInfaqNominal: students.infaqNominal,
      studentInfaqStatus: students.infaqStatus,
      classroomName: classrooms.name,
      classroomInfaqNominal: classrooms.infaqNominal,
    })
    .from(studentEnrollments)
    .innerJoin(students, and(eq(studentEnrollments.studentId, students.id), isNull(students.deletedAt), eq(students.status, "aktif" as any)))
    .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
    .where(and(...enrollmentConditions));

    if (enrollments.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada siswa aktif yang ditemukan di enrollment untuk tahun ajaran dan kelas yang dipilih." },
        { status: 400 }
      );
    }

    // 4. Validasi Nominal
    const invalidStudents = enrollments.filter(s => {
      const cat = (s.studentCategory || "reguler").toLowerCase();
      const status = (s.studentInfaqStatus || "reguler").toLowerCase();
      if (cat !== "reguler" && status === "gratis") return false;
      if (status === "potongan" || status === "subsidi") return !s.studentInfaqNominal || s.studentInfaqNominal <= 0;
      return !s.classroomInfaqNominal || s.classroomInfaqNominal <= 0;
    });

    if (invalidStudents.length > 0) {
      const kelasSet = new Set<string>();
      invalidStudents.forEach(s => { if (s.classroomName) kelasSet.add(s.classroomName); });
      const kelasInfo = kelasSet.size > 0 ? ` (Kelas: ${[...kelasSet].join(", ")})` : "";
      return NextResponse.json({
        success: false,
        message: `Nominal SPP / Infaq belum diatur.${kelasInfo} Terdapat ${invalidStudents.length} siswa yang belum memiliki tarif.`,
        invalidCount: invalidStudents.length
      }, { status: 400 });
    }

    // 5. Cek duplikasi
    const studentIds = enrollments.map(s => s.studentId).filter((id): id is number => id !== null);
    const existingBills = studentIds.length > 0 ? await db.select({ studentId: infaqBills.studentId, month: infaqBills.month })
      .from(infaqBills)
      .where(and(
        eq(infaqBills.year, String(year)),
        inArray(infaqBills.month, resolvedMonths),
        isNull(infaqBills.deletedAt),
        inArray(infaqBills.studentId, studentIds),
        eq(infaqBills.academicYearId, resolvedAcademicYearId)
      )) : [];

    const existingSet = new Set(existingBills.map(b => `${b.studentId}-${b.month}`));

    // 6. Siapkan data tagihan baru
    const billsToCreate: any[] = [];

    for (const student of enrollments) {
      for (const month of resolvedMonths) {
        const key = `${student.studentId}-${String(month)}`;
        if (existingSet.has(key)) continue;

        const kelasNominal = student.classroomInfaqNominal || 0;
        let nominal = 0;
        let billStatus = "belum_lunas";

        const cat = (student.studentCategory || "reguler").toLowerCase();
        const status = (student.studentInfaqStatus || "reguler").toLowerCase();

        if (cat === "reguler") {
          nominal = kelasNominal;
        } else {
          if (status === "gratis") {
            nominal = 0;
            billStatus = "lunas";
          } else if (status === "potongan" || status === "subsidi") {
            nominal = student.studentInfaqNominal || 0;
          } else {
            nominal = kelasNominal;
          }
        }

        billsToCreate.push({
          studentId: student.studentId,
          month: String(month),
          year: String(year),
          nominal,
          status: billStatus as any,
          unitId: user.unitId || "",
          academicYearId: resolvedAcademicYearId,
        });
      }
    }

    if (billsToCreate.length === 0) {
      return NextResponse.json(
        { success: false, message: "Semua tagihan untuk periode dan tahun tersebut sudah ada" },
        { status: 400 }
      );
    }

    // 7. Buat tagihan dalam transaction (atomik)
    let insertedCount = 0;
    await db.transaction(async (tx) => {
      const result = await tx.insert(infaqBills).values(billsToCreate).onConflictDoNothing();
      insertedCount = billsToCreate.length; // approximate
    });

    const periodeDesc = resolvedPeriod === "tahunan"
      ? "1 Tahun Ajaran Penuh"
      : resolvedPeriod === "semester"
      ? `Semester ${semester}`
      : `${resolvedMonths.length} bulan`;

    return NextResponse.json({
      success: true,
      message: `Berhasil generate ${insertedCount} tagihan untuk ${enrollments.length} siswa × ${periodeDesc}`,
      count: insertedCount,
      skipped: existingBills.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Generate infaq bills error:", error);
    return NextResponse.json({ success: false, message: "Gagal generate tagihan" }, { status: 500 });
  }
}
