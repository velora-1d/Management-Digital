import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms, infaqBills, studentSavings, studentEnrollments, academicYears } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, desc, sql, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auditLogs } from "@/db/schema";

export const dynamic = "force-dynamic";

type StudentSavingsStatus = "active";
type StudentSavingsType = "setor" | "tarik";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth();
    const id = parseInt(params.id);

    const [student] = await db.select().from(students)
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .limit(1);

    if (!student) return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });

    // Get classroom
    let classroom = null;
    if (student.classroomId) {
      const [cls] = await db.select().from(classrooms).where(eq(classrooms.id, student.classroomId)).limit(1);
      classroom = cls || null;
    }

    // Get bills
    const bills = await db.select().from(infaqBills)
      .where(and(eq(infaqBills.studentId, id), isNull(infaqBills.deletedAt)))
      .orderBy(desc(infaqBills.month))
      .limit(12);

    // Get savings
    const savings = await db.select().from(studentSavings)
      .where(and(eq(studentSavings.studentId, id), isNull(studentSavings.deletedAt), eq(studentSavings.status, "active" as StudentSavingsStatus)))
      .orderBy(desc(studentSavings.createdAt))
      .limit(10);

    // Enrollments
    const enrollmentList = await db.select({
      id: studentEnrollments.id,
      classroomId: studentEnrollments.classroomId,
      academicYearId: studentEnrollments.academicYearId,
      classroomName: classrooms.name,
    })
    .from(studentEnrollments)
    .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
    .where(eq(studentEnrollments.studentId, id))
    .orderBy(desc(studentEnrollments.createdAt));

    // Hitung saldo tabungan
    const [{ totalSetor }] = await db.select({ totalSetor: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
      .from(studentSavings).where(and(eq(studentSavings.studentId, id), eq(studentSavings.type, "setor" as StudentSavingsType), eq(studentSavings.status, "active" as StudentSavingsStatus), isNull(studentSavings.deletedAt)));
    const [{ totalTarik }] = await db.select({ totalTarik: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
      .from(studentSavings).where(and(eq(studentSavings.studentId, id), eq(studentSavings.type, "tarik" as StudentSavingsType), eq(studentSavings.status, "active" as StudentSavingsStatus), isNull(studentSavings.deletedAt)));

    const savingsBalance = totalSetor - totalTarik;
    const tunggakan = bills.filter(b => b.status === "belum_lunas").length;

    return NextResponse.json({
      success: true,
      data: { ...student, classroom, infaqBills: bills, savings, enrollments: enrollmentList, savingsBalance, tunggakanCount: tunggakan }
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const studentId = parseInt(params.id);

    // 1. Ambil data lama
    const [existing] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, studentId), isNull(students.deletedAt)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // 2. Pengecekan Duplikasi (jika NISN atau NIK diubah)
    const { nisn, nik } = body;
    if ((nisn && nisn !== existing.nisn) || (nik && nik !== existing.nik)) {
      const [duplicate] = await db.select()
        .from(students)
        .where(
          and(
            ne(students.id, studentId),
            isNull(students.deletedAt),
            or(
              nisn ? eq(students.nisn, nisn.trim()) : undefined,
              nik ? eq(students.nik, nik.trim()) : undefined
            )
          )
        )
        .limit(1);

      if (duplicate) {
        const field = duplicate.nisn === nisn?.trim() ? "NISN" : "NIK";
        return NextResponse.json({ 
          success: false, 
          message: `${field} "${field === 'NISN' ? nisn : nik}" sudah terdaftar pada siswa lain.` 
        }, { status: 400 });
      }
    }

    const updateData: Partial<typeof students.$inferInsert> = {
      updatedAt: new Date(),
    };
    const mutableUpdateData = updateData as Partial<typeof students.$inferInsert> & Record<string, unknown>;

    const keys = [
      "name", "nisn", "nis", "nik", "noKk", "gender", "religion", "category",
      "status", "birthPlace", "birthDate", "address", "phone", "classroomId",
      "familyStatus", "siblingCount", "childPosition", "village", "district",
      "residenceType", "transportation", "previousSchool", "studentPhone", "height", "weight",
      "distanceToSchool", "travelTime", "fatherName", "fatherNik",
      "fatherBirthPlace", "fatherBirthDate", "fatherEducation",
      "fatherOccupation", "motherName", "motherNik", "motherBirthPlace",
      "motherBirthDate", "motherEducation", "motherOccupation", "parentIncome",
      "guardianName", "guardianNik", "guardianBirthPlace", "guardianBirthDate",
      "guardianEducation", "guardianOccupation", "guardianAddress",
      "guardianPhone", "infaqStatus", "infaqNominal"
    ];

    if (body.no_kk !== undefined && body.noKk === undefined) updateData.noKk = body.no_kk;
    if (body.place_of_birth !== undefined && body.birthPlace === undefined) updateData.birthPlace = body.place_of_birth;
    if (body.date_of_birth !== undefined && body.birthDate === undefined) updateData.birthDate = body.date_of_birth;
    if (body.parent_phone !== undefined && body.phone === undefined) updateData.phone = body.parent_phone;
    if (body.classroom !== undefined && body.classroomId === undefined) updateData.classroomId = body.classroom ? Number(body.classroom) : null;
    if (body.father_name !== undefined && body.fatherName === undefined) updateData.fatherName = body.father_name;
    if (body.mother_name !== undefined && body.motherName === undefined) updateData.motherName = body.mother_name;

    for (const key of keys) {
      if (body[key] !== undefined) {
        if (["siblingCount", "childPosition", "height", "weight", "travelTime"].includes(key)) {
           mutableUpdateData[key] = body[key] ? Number(body[key]) : null;
        } else if (["classroomId", "infaqNominal"].includes(key)) {
           mutableUpdateData[key] = body[key] ? Number(body[key]) : (key === "infaqNominal" ? 0 : null);
        } else {
           mutableUpdateData[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
        }
      }
    }

    const [student] = await db.transaction(async (tx) => {
      const [updatedStudent] = await tx.update(students).set(updateData).where(eq(students.id, studentId)).returning();

      // Sinkronisasi Enrollment ke Tahun Ajaran Aktif
      const activeYearRes = await tx.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      
      if (activeYearRes.length > 0) {
        const yearId = activeYearRes[0].id;
        const currentClassId = updateData.classroomId !== undefined ? updateData.classroomId : updatedStudent.classroomId;

        const existingEnrollment = await tx.select()
          .from(studentEnrollments)
          .where(and(
            eq(studentEnrollments.studentId, studentId), 
            eq(studentEnrollments.academicYearId, yearId),
            isNull(studentEnrollments.deletedAt)
          ))
          .limit(1);
        
        if (existingEnrollment.length > 0) {
          await tx.update(studentEnrollments)
            .set({ classroomId: currentClassId, updatedAt: new Date() })
            .where(eq(studentEnrollments.id, existingEnrollment[0].id));
        } else {
          await tx.insert(studentEnrollments).values({
            studentId,
            classroomId: currentClassId,
            academicYearId: yearId,
            enrollmentType: "umum",
          });
        }
      }

      // 4. Audit Log
      await tx.insert(auditLogs).values({
        userId: existing.id, // atau user ID dari session jika ada
        action: "UPDATE_STUDENT",
        modelType: "students",
        modelId: studentId.toString(),
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(updatedStudent),
      });

      return [updatedStudent];
    });

    revalidatePath("/students");
    revalidatePath("/classrooms");
    revalidatePath("/infaq-bills");

    return NextResponse.json({ success: true, message: "Data siswa berhasil diperbarui", data: student });
  } catch (error: unknown) {
    console.error("Error updating student:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === '23505') {
      return NextResponse.json({ success: false, message: "NISN atau NIK sudah dipakai siswa lain" }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "Gagal memperbarui data siswa";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db.update(students)
      .set({ 
        deletedAt: new Date(),
        status: "dihapus",
        updatedAt: new Date()
      })
      .where(eq(students.id, parseInt(params.id)));
      
    revalidatePath("/students");

    return NextResponse.json({ success: true, message: "Data siswa berhasil dihapus" });
  } catch (error: unknown) {
    console.error("Error deleting student:", error);
    const msg = error instanceof Error ? error.message : "Gagal menghapus data siswa";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export const PATCH = PUT;
