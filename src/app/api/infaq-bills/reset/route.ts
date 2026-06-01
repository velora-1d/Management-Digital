import { NextResponse } from "next/server";
import { db } from "@/db";
import { infaqBills, infaqPayments, students, studentEnrollments, academicYears } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, inArray, sql } from "drizzle-orm";

const MONTH_NUM_TO_NAME: Record<number, string> = {
  1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
  5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
  9: "September", 10: "Oktober", 11: "November", 12: "Desember"
};

const SEMESTER_1_MONTHS = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const SEMESTER_2_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { year, months, classroomId, semester, academicYearId } = body;

    if (!year) {
      return NextResponse.json({ success: false, message: "Tahun wajib diisi" }, { status: 400 });
    }

    // 1. Tentukan bulan
    let targetMonths: string[] = [];
    if (months && Array.isArray(months) && months.length > 0) {
      targetMonths = months.map((m: number | string) => {
        const num = Number(m);
        return MONTH_NUM_TO_NAME[num] || String(m);
      });
    } else if (semester) {
      const sem = Number(semester);
      if (sem === 1) targetMonths = [...SEMESTER_1_MONTHS];
      else if (sem === 2) targetMonths = [...SEMESTER_2_MONTHS];
      else return NextResponse.json({ success: false, message: "Semester harus 1 atau 2" }, { status: 400 });
    } else {
      return NextResponse.json({ success: false, message: "Pilih bulan atau semester yang akan di-reset" }, { status: 400 });
    }

    // 2. Build conditions
    const conditions = [eq(infaqBills.year, String(year)), inArray(infaqBills.month, targetMonths), isNull(infaqBills.deletedAt)];

    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;
    if (!targetAcademicYearId) {
      const [activeYear] = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYear?.id || null;
    }

    if (targetAcademicYearId) {
      conditions.push(eq(infaqBills.academicYearId, targetAcademicYearId));
    }

    if (classroomId) {
      const studentsInClass = await db.select({ id: students.id })
        .from(studentEnrollments)
        .innerJoin(students, eq(studentEnrollments.studentId, students.id))
        .where(and(
          eq(studentEnrollments.classroomId, Number(classroomId)),
          targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined,
          isNull(studentEnrollments.deletedAt),
          isNull(students.deletedAt)
        ));
      const sIds = studentsInClass.map(s => s.id);
      if (sIds.length > 0) conditions.push(inArray(infaqBills.studentId, sIds));
      else {
        return NextResponse.json({ success: false, message: "Tidak ada siswa aktif di kelas tersebut untuk tahun ajaran yang dipilih" }, { status: 400 });
      }
    }

    // 3. Query bills to reset
    const billsToReset = await db.select({ id: infaqBills.id, status: infaqBills.status, month: infaqBills.month })
      .from(infaqBills)
      .where(and(...conditions));

    if (billsToReset.length === 0) {
      return NextResponse.json(
        { success: false, message: `Tidak ada tagihan yang ditemukan. Bulan: [${targetMonths.join(", ")}], Tahun: ${year}` },
        { status: 400 }
      );
    }

    // 4. Validasi tagihan lunas
    const lunasBills = billsToReset.filter(b => b.status === "lunas");
    if (lunasBills.length > 0) {
      const lunasIds = lunasBills.map(b => b.id);
      const [{ paymentCount }] = await db.select({ paymentCount: sql<number>`count(*)`.mapWith(Number) })
        .from(infaqPayments)
        .where(and(inArray(infaqPayments.billId, lunasIds), isNull(infaqPayments.deletedAt)));

      if (paymentCount > 0) {
        return NextResponse.json({
          success: false,
          message: `Terdapat ${lunasBills.length} tagihan lunas dengan ${paymentCount} pembayaran aktif. Void tagihan terlebih dahulu.`,
        }, { status: 400 });
      }
    }

    const billIds = billsToReset.map(b => b.id);

    // 5. Hard delete dalam transaction
    await db.transaction(async (tx) => {
      await tx.delete(infaqPayments).where(inArray(infaqPayments.billId, billIds));
      await tx.delete(infaqBills).where(inArray(infaqBills.id, billIds));
    });

    const monthDesc = semester ? `Semester ${semester}` : `bulan ${targetMonths.join(", ")}`;
    const filterDesc = classroomId ? ` untuk kelas tersebut` : "";

    return NextResponse.json({
      success: true,
      message: `Berhasil reset ${billsToReset.length} tagihan (${monthDesc}, ${year}${filterDesc})`,
      count: billsToReset.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Reset infaq bills error:", error);
    return NextResponse.json({ success: false, message: "Gagal reset tagihan" }, { status: 500 });
  }
}
