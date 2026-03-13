import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms, infaqBills, studentSavings, studentEnrollments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";

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
      .where(and(eq(studentSavings.studentId, id), isNull(studentSavings.deletedAt), eq(studentSavings.status, "active" as any)))
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
      .from(studentSavings).where(and(eq(studentSavings.studentId, id), eq(studentSavings.type, "setor" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));
    const [{ totalTarik }] = await db.select({ totalTarik: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number) })
      .from(studentSavings).where(and(eq(studentSavings.studentId, id), eq(studentSavings.type, "tarik" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

    const savingsBalance = totalSetor - totalTarik;
    const tunggakan = bills.filter(b => b.status === "belum_lunas").length;

    return NextResponse.json({
      success: true,
      data: { ...student, classroom, infaqBills: bills, savings, enrollments: enrollmentList, savingsBalance, tunggakanCount: tunggakan }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();

    const [student] = await db.update(students).set({
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
      familyStatus: body.familyStatus || "",
      siblingCount: body.siblingCount ? Number(body.siblingCount) : null,
      childPosition: body.childPosition ? Number(body.childPosition) : null,
      village: body.village || "",
      district: body.district || "",
      residenceType: body.residenceType || "",
      transportation: body.transportation || "",
      studentPhone: body.studentPhone || "",
      height: body.height ? Number(body.height) : null,
      weight: body.weight ? Number(body.weight) : null,
      distanceToSchool: body.distanceToSchool || "",
      travelTime: body.travelTime ? Number(body.travelTime) : null,
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
      guardianName: body.guardianName || "",
      guardianNik: body.guardianNik || "",
      guardianBirthPlace: body.guardianBirthPlace || "",
      guardianBirthDate: body.guardianBirthDate || "",
      guardianEducation: body.guardianEducation || "",
      guardianOccupation: body.guardianOccupation || "",
      guardianAddress: body.guardianAddress || "",
      guardianPhone: body.guardianPhone || "",
      infaqStatus: body.infaqStatus || "reguler",
      infaqNominal: body.infaqNominal ? Number(body.infaqNominal) : 0,
      updatedAt: new Date(),
    }).where(eq(students.id, parseInt(params.id))).returning();

    return NextResponse.json({ success: true, message: "Data siswa berhasil diupdate", data: student });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai" }, { status: 400 });
    }
    console.error("Error updating student:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db.update(students).set({ deletedAt: new Date() }).where(eq(students.id, parseInt(params.id)));
    return NextResponse.json({ success: true, message: "Data dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
