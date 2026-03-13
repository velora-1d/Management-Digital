import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentEnrollments, classrooms, academicYears } from "@/db/schema";
import { and, eq, ilike, or, gte, lte, isNull, asc, sql } from "drizzle-orm";

/**
 * Mengekstrak field Dapodik dari body request.
 * Menangani field lama (place_of_birth, father_name dll) DAN field baru (birthPlace, fatherName dll).
 */
function extractStudentData(body: any) {
  return {
    name: body.name,
    nisn: body.nisn || "",
    nis: body.nis || "",
    nik: body.nik || "",
    noKk: body.noKk || body.no_kk || "",
    gender: body.gender || "L",
    religion: body.religion || "Islam",
    category: body.category || "reguler",
    status: body.status || "aktif",
    birthPlace: body.birthPlace || body.place_of_birth || "",
    birthDate: body.birthDate || body.date_of_birth || "",
    address: body.address || "",
    phone: body.phone || body.parent_phone || "",
    classroomId: (body.classroomId || body.classroom) ? Number(body.classroomId || body.classroom) : null,
    // A. Identitas (Dapodik)
    familyStatus: body.familyStatus || "",
    siblingCount: body.siblingCount ? Number(body.siblingCount) : null,
    childPosition: body.childPosition ? Number(body.childPosition) : null,
    village: body.village || "",
    district: body.district || "",
    residenceType: body.residenceType || "",
    transportation: body.transportation || "",
    studentPhone: body.studentPhone || "",
    // B. Periodik
    height: body.height ? Number(body.height) : null,
    weight: body.weight ? Number(body.weight) : null,
    distanceToSchool: body.distanceToSchool || "",
    travelTime: body.travelTime ? Number(body.travelTime) : null,
    // C. Orang Tua
    fatherName: body.fatherName || body.father_name || "",
    fatherNik: body.fatherNik || "",
    fatherBirthPlace: body.fatherBirthPlace || "",
    fatherBirthDate: body.fatherBirthDate || "",
    fatherEducation: body.fatherEducation || "",
    fatherOccupation: body.fatherOccupation || "",
    motherName: body.motherName || body.mother_name || "",
    motherNik: body.motherNik || "",
    motherBirthPlace: body.motherBirthPlace || "",
    motherBirthDate: body.motherBirthDate || "",
    motherEducation: body.motherEducation || "",
    motherOccupation: body.motherOccupation || "",
    parentIncome: body.parentIncome || "",
    // D. Wali
    guardianName: body.guardianName || "",
    guardianNik: body.guardianNik || "",
    guardianBirthPlace: body.guardianBirthPlace || "",
    guardianBirthDate: body.guardianBirthDate || "",
    guardianEducation: body.guardianEducation || "",
    guardianOccupation: body.guardianOccupation || "",
    guardianAddress: body.guardianAddress || "",
    guardianPhone: body.guardianPhone || "",
    // E. Administrasi
    infaqStatus: body.infaqStatus || "reguler",
    infaqNominal: body.infaqNominal ? Number(body.infaqNominal) : 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";
  const reqClassroomId = searchParams.get("classroomId") || searchParams.get("classroom") || "";
  const reqAcademicYearId = searchParams.get("academicYearId") || "";
  const gender = searchParams.get("gender") || "";
  const status = searchParams.get("status") || "aktif";
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");

  try {
    // 1. Tentukan Tahun Ajaran Target
    let targetAcademicYearId = reqAcademicYearId ? Number(reqAcademicYearId) : null;
    if (!targetAcademicYearId) {
      const activeYearRes = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;
    }

    // 2. Bangun Filter Enrollment (Sumber Utama Kebenaran Data per Tahun Ajaran)
    const conditions = [
      isNull(studentEnrollments.deletedAt),
      isNull(students.deletedAt)
    ];

    if (targetAcademicYearId) {
      conditions.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
    }

    if (reqClassroomId) {
      conditions.push(eq(studentEnrollments.classroomId, Number(reqClassroomId)));
    }

    if (search) {
      const searchCondition = or(
        ilike(students.name, `%${search}%`),
        ilike(students.nisn, `%${search}%`),
        ilike(students.nis, `%${search}%`)
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    if (gender) {
      conditions.push(eq(students.gender, gender));
    }

    if (status) {
      conditions.push(eq(students.status, status));
    }

    if (ageMin || ageMax) {
      if (ageMin) {
        const d = new Date();
        const maxDate = new Date(d.getFullYear() - Number(ageMin), d.getMonth(), d.getDate()).toISOString();
        conditions.push(lte(students.birthDate, maxDate));
      }
      if (ageMax) {
        const d = new Date();
        const minDate = new Date(d.getFullYear() - Number(ageMax) - 1, d.getMonth(), d.getDate() + 1).toISOString();
        conditions.push(gte(students.birthDate, minDate));
      }
    }

    const whereClause = and(...conditions);

    const [enrollmentsRes, totalRes] = await Promise.all([
      db.select({
        student: students,
        enrollmentId: studentEnrollments.id,
        enrollmentType: studentEnrollments.enrollmentType,
        classroom: {
          id: classrooms.id,
          name: classrooms.name
        },
        academicYear: {
          id: academicYears.id,
          year: academicYears.year
        }
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(studentEnrollments.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .where(whereClause)
    ]);

    // Transform agar format output tetap sama dengan yang diharapkan frontend (List of Students)
    const resultStudents = enrollmentsRes.map(e => ({
      ...e.student,
      classroom: e.classroom,
      enrollment: {
        id: e.enrollmentId,
        enrollmentType: e.enrollmentType,
        academicYear: e.academicYear
      }
    }));

    const total = totalRes[0].count;

    return NextResponse.json({
      success: true,
      data: resultStudents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET Students error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = extractStudentData(body);

    if (!data.name) {
      return NextResponse.json({ success: false, message: "Nama siswa wajib diisi" }, { status: 400 });
    }

    const [student] = await db.insert(students).values(data).returning();

    return NextResponse.json({ success: true, message: "Data siswa berhasil ditambahkan", data: student });
  } catch (error: any) {
    // Drizzle postgres duplicate key error is usually 23505
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai siswa lain" }, { status: 400 });
    }
    console.error("Error creating student:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
