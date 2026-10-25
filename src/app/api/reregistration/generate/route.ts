import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, academicYears, reRegistrations, schoolSettings, registrationPayments } from "@/db/schema";
import { requireAuth } from "@/lib/rbac";
import { eq, and, isNull, inArray } from "drizzle-orm";

export async function POST() {
  try {
    const user = await requireAuth();

    // Cari siswa aktif
    const activeStudents = await db
      .select({ id: students.id, name: students.name })
      .from(students)
      .where(and(eq(students.status, "aktif"), isNull(students.deletedAt)));

    if (activeStudents.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Tidak ada siswa aktif ditemukan" });
    }

    // Cari academic year yang aktif
    const [currentAcademicYear] = await db
      .select()
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);

    if (!currentAcademicYear) {
      return NextResponse.json(
        { error: "Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran terlebih dahulu." },
        { status: 400 }
      );
    }

    const academicYearId = currentAcademicYear.id;

    // Cari existing reregistrations
    const existingList = await db
      .select({ studentId: reRegistrations.studentId })
      .from(reRegistrations)
      .where(and(eq(reRegistrations.academicYearId, academicYearId), isNull(reRegistrations.deletedAt)));

    const existingStudentIds = new Set(existingList.map((e) => e.studentId));
    let count = 0;

    // Ambil settings biaya daftar ulang dan buku
    const feeKeys = ["re_registration_fee", "books_fee"];
    const settingsList = await db
      .select()
      .from(schoolSettings)
      .where(inArray(schoolSettings.key, feeKeys));
      
    const feeMap: Record<string, number> = {};
    settingsList.forEach((s) => { feeMap[s.key] = Number(s.value) || 0; });

    // Generate dalam transaction
    await db.transaction(async (tx) => {
      for (const student of activeStudents) {
        if (!existingStudentIds.has(student.id)) {
          const [newReg] = await tx
            .insert(reRegistrations)
            .values({
              studentId: student.id,
              academicYearId: academicYearId,
              status: "pending",
            })
            .returning();

          // Buat otomatis tagihan Daftar Ulang fee & books_fee
          const paymentTypes = [
            { type: "fee", nominal: feeMap["re_registration_fee"] || 0 },
            { type: "books", nominal: feeMap["books_fee"] || 0 },
          ];

          await tx.insert(registrationPayments).values(
            paymentTypes.map(pt => ({
              payableType: "reregistration",
              payableId: newReg.id,
              paymentType: pt.type,
              nominal: pt.nominal,
              isPaid: false,
              unitId: user.unitId || "",
            }))
          );

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
    console.error("Reregistration Generate error:", error);
    return NextResponse.json(
      { error: "Gagal men-generate data daftar ulang" },
      { status: 500 }
    );
  }
}
