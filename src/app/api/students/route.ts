import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, studentEnrollments, academicYears } from "@/db/schema";
import { and, eq, or, isNull } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getStudentsList } from "@/lib/students";

/**
 * Mengekstrak field Dapodik dari body request.
 */
function extractStudentData(body: Record<string, unknown>) {
  const b = body as Record<string, string | number | boolean | null | undefined>;
  return {
    name: b.name as string,
    nisn: (b.nisn || "") as string,
    nis: (b.nis || "") as string,
    nik: (b.nik || "") as string,
    noKk: (b.noKk || b.no_kk || "") as string,
    gender: (b.gender || "L") as string,
    religion: (b.religion || "Islam") as string,
    category: (b.category || "reguler") as string,
    status: (b.status || "aktif") as string,
    birthPlace: (b.birthPlace || b.place_of_birth || "") as string,
    birthDate: (b.birthDate || b.date_of_birth || "") as string,
    address: (b.address || "") as string,
    phone: (b.phone || b.parent_phone || "") as string,
    classroomId: (b.classroomId || b.classroom) ? Number(b.classroomId || b.classroom) : null,
    // A. Identitas (Dapodik)
    familyStatus: (b.familyStatus || "") as string,
    siblingCount: b.siblingCount ? Number(b.siblingCount) : null,
    childPosition: b.childPosition ? Number(b.childPosition) : null,
    village: (b.village || "") as string,
    district: (b.district || "") as string,
    residenceType: (b.residenceType || "") as string,
    transportation: (b.transportation || "") as string,
    previousSchool: (b.previousSchool || b.asalTk || "") as string,
    studentPhone: (b.studentPhone || "") as string,
    // B. Periodik
    height: b.height ? Number(b.height) : null,
    weight: b.weight ? Number(b.weight) : null,
    distanceToSchool: (b.distanceToSchool || "") as string,
    travelTime: b.travelTime ? Number(b.travelTime) : null,
    // C. Orang Tua
    fatherName: (b.fatherName || b.father_name || "") as string,
    fatherNik: (b.fatherNik || "") as string,
    fatherBirthPlace: (b.fatherBirthPlace || "") as string,
    fatherBirthDate: (b.fatherBirthDate || "") as string,
    fatherEducation: (b.fatherEducation || "") as string,
    fatherOccupation: (b.fatherOccupation || "") as string,
    motherName: (b.motherName || b.mother_name || "") as string,
    motherNik: (b.motherNik || "") as string,
    motherBirthPlace: (b.motherBirthPlace || "") as string,
    motherBirthDate: (b.motherBirthDate || "") as string,
    motherEducation: (b.motherEducation || "") as string,
    motherOccupation: (b.motherOccupation || "") as string,
    parentIncome: (b.parentIncome || "") as string,
    // D. Wali
    guardianName: (b.guardianName || "") as string,
    guardianNik: (b.guardianNik || "") as string,
    guardianBirthPlace: (b.guardianBirthPlace || "") as string,
    guardianBirthDate: (b.guardianBirthDate || "") as string,
    guardianEducation: (b.guardianEducation || "") as string,
    guardianOccupation: (b.guardianOccupation || "") as string,
    guardianAddress: (b.guardianAddress || "") as string,
    guardianPhone: (b.guardianPhone || "") as string,
    // E. Administrasi
    infaqStatus: (b.infaqStatus || "reguler") as string,
    infaqNominal: b.infaqNominal ? Number(b.infaqNominal) : 0,
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
    const result = await getStudentsList({
      page,
      limit,
      search,
      classroomId: reqClassroomId,
      academicYearId: reqAcademicYearId,
      gender,
      status,
      ageMin,
      ageMax,
    });

    const response = NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error: unknown) {
    console.error("GET Students error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = extractStudentData(body);

    if (!data.name?.trim()) {
      return NextResponse.json({ success: false, message: "Nama siswa wajib diisi" }, { status: 400 });
    }

    // 1. Cari tahun ajaran aktif
    const activeYearRes = await db.select({ id: academicYears.id })
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);
    
    if (activeYearRes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran di menu Pengaturan terlebih dahulu." 
      }, { status: 400 });
    }

    const targetYearId = activeYearRes[0].id;

    // 2. Cek Duplikasi
    const dupeConds = [];
    if (data.nisn?.trim()) dupeConds.push(eq(students.nisn, data.nisn.trim()));
    if (data.nik?.trim()) dupeConds.push(eq(students.nik, data.nik.trim()));

    const existing = await db.select()
      .from(students)
      .where(
        and(
          isNull(students.deletedAt),
          dupeConds.length > 0 ? or(...dupeConds) : eq(students.id, -1)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];

      if (!record.deletedAt) {
        return NextResponse.json({ 
          success: false, 
          message: `Siswa dengan Nama/NIS/NISN/NIK tersebut sudah terdaftar dan masih aktif.` 
        }, { status: 400 });
      }

      // Jika terhapus, lakukan Restore
      const student = await db.transaction(async (tx) => {
        const [restored] = await tx.update(students)
          .set({
            ...data,
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(students.id, record.id))
          .returning();

        const existingEnrollment = await tx.select()
          .from(studentEnrollments)
          .where(and(
            eq(studentEnrollments.studentId, record.id),
            eq(studentEnrollments.academicYearId, targetYearId),
            isNull(studentEnrollments.deletedAt)
          ))
          .limit(1);
        
        if (existingEnrollment.length === 0) {
           await tx.insert(studentEnrollments).values({
            studentId: record.id,
            classroomId: data.classroomId,
            academicYearId: targetYearId,
            enrollmentType: "kembali",
          });
        } else {
           await tx.update(studentEnrollments)
            .set({ classroomId: data.classroomId, updatedAt: new Date() })
            .where(eq(studentEnrollments.id, existingEnrollment[0].id));
        }

        return restored;
      });

      return NextResponse.json({ 
        success: true, 
        message: "Data siswa yang sebelumnya terhapus telah diaktifkan kembali.", 
        data: student,
        isRestored: true 
      });
    }

    // 3. Insert Baru
    const newStudent = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(students).values(data).returning();

      await tx.insert(studentEnrollments).values({
        studentId: inserted.id,
        classroomId: data.classroomId,
        academicYearId: targetYearId,
        enrollmentType: "baru",
      });

      return inserted;
    });

    revalidateTag("students");

    return NextResponse.json({ success: true, message: "Data siswa berhasil ditambahkan", data: newStudent });
  } catch (error: unknown) {
    console.error("Error creating student:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === '23505' || err.message?.includes('duplicate key')) {
      return NextResponse.json({ success: false, message: "NIS, NISN, atau NIK sudah dipakai siswa lain" }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
