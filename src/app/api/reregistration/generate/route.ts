import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function POST() {
  try {
    const user = await requireAuth();

    // Cari siswa aktif
    const activeStudents = await prisma.student.findMany({
      where: { status: "aktif", deletedAt: null },
      select: { id: true, name: true },
    });

    if (activeStudents.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada siswa aktif ditemukan" });
    }

    // Cari academic year yang aktif
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
    });

    if (!currentAcademicYear) {
      return NextResponse.json(
        { error: "Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran terlebih dahulu." },
        { status: 400 }
      );
    }

    const academicYearId = currentAcademicYear.id;

    // Cari existing reregistrations
    const existing = await prisma.reRegistration.findMany({
      where: { academicYearId, deletedAt: null },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existing.map((e) => e.studentId));
    let count = 0;

    // Ambil settings biaya daftar ulang dan buku
    const feeKeys = ["re_registration_fee", "books_fee"];
    const settings = await prisma.schoolSetting.findMany({
      where: { key: { in: feeKeys } },
    });
    const feeMap: Record<string, number> = {};
    settings.forEach((s: any) => { feeMap[s.key] = Number(s.value) || 0; });

    // Generate dalam transaction
    await prisma.$transaction(async (tx) => {
      for (const student of activeStudents) {
        if (!existingStudentIds.has(student.id)) {
          const newReg = await tx.reRegistration.create({
            data: {
              studentId: student.id,
              academicYearId: academicYearId,
              status: "pending",
            },
          });

          // Buat otomatis tagihan Daftar Ulang fee & books_fee
          const paymentTypes = [
            { type: "fee", nominal: feeMap["re_registration_fee"] || 0 },
            { type: "books", nominal: feeMap["books_fee"] || 0 },
          ];

          await tx.registrationPayment.createMany({
            data: paymentTypes.map(pt => ({
              payableType: "reregistration",
              payableId: newReg.id,
              paymentType: pt.type,
              nominal: pt.nominal,
              isPaid: false,
              unitId: user.unitId || "",
            })),
          });

          count++;
        }
      }
    });

    return NextResponse.json({
      success: true,
      count,
      message: `Pendaftaran ulang untuk ${count} siswa berhasil digenerate.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal men-generate data daftar ulang" },
      { status: 500 }
    );
  }
}
