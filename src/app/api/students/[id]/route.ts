import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await requireAuth();
    const id = parseInt(params.id);
    const student = await prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: {
        classroom: true,
        infaqBills: { where: { deletedAt: null }, orderBy: { month: "desc" }, take: 12 },
        savings: { where: { deletedAt: null, status: "active" }, orderBy: { createdAt: "desc" }, take: 10 },
        enrollments: { include: { classroom: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!student) return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });

    // Hitung saldo tabungan
    let savingsBalance = 0;
    const allSv = await prisma.studentSaving.findMany({ where: { studentId: id, deletedAt: null, status: "active" } });
    allSv.forEach((sv) => { if (sv.type === "setor") savingsBalance += sv.amount; else if (sv.type === "tarik") savingsBalance -= sv.amount; });

    const tunggakan = student.infaqBills.filter((b) => b.status === "belum_lunas").length;

    return NextResponse.json({ success: true, data: { ...student, savingsBalance, tunggakanCount: tunggakan } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const body = await request.json();

    const student = await prisma.student.update({
      where: { id: parseInt(params.id) },
      data: {
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
      }
    });

    return NextResponse.json({ success: true, message: "Data siswa berhasil diupdate", data: student });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai" }, { status: 400 });
    }
    console.error("Error updating student:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Soft delete
    await prisma.student.update({
      where: { id: parseInt(params.id) },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, message: "Data dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
