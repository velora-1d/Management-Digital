import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrationPayments, reRegistrations, students, academicYears } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Dapatkan Tahun Ajaran Aktif
    const activeYearRes = await db.select({ id: academicYears.id })
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);
    const activeYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;

    // 2. Hitung statistik jumlah siswa
    const studentStats = await db
      .select({
        status: reRegistrations.status,
        count: sql<number>`count(*)`,
      })
      .from(reRegistrations)
      .innerJoin(students, eq(reRegistrations.studentId, students.id))
      .where(
        and(
          isNull(reRegistrations.deletedAt),
          isNull(students.deletedAt),
          eq(students.status, 'aktif'),
          activeYearId ? eq(reRegistrations.academicYearId, activeYearId) : undefined
        )
      )
      .groupBy(reRegistrations.status);

    const counts = {
      total: 0,
      confirmed: 0,
      pending: 0,
      not_registered: 0,
    };

    studentStats.forEach((s) => {
      const c = Number(s.count);
      counts.total += c;
      if (s.status === "confirmed") counts.confirmed = c;
      else if (s.status === "pending") counts.pending = c;
      else if (s.status === "not_registered") counts.not_registered = c;
    });

    // 3. Query pembayaran hanya untuk siswa aktif dan tahun ajaran aktif
    const paymentsList = await db
      .select({
        paymentType: registrationPayments.paymentType,
        nominal: registrationPayments.nominal,
      })
      .from(registrationPayments)
      .innerJoin(reRegistrations, eq(registrationPayments.payableId, reRegistrations.id))
      .innerJoin(students, eq(reRegistrations.studentId, students.id))
      .where(
        and(
          eq(registrationPayments.payableType, "reregistration"),
          eq(registrationPayments.isPaid, true),
          isNull(registrationPayments.deletedAt),
          isNull(reRegistrations.deletedAt),
          isNull(students.deletedAt),
          eq(students.status, 'aktif'),
          activeYearId ? eq(reRegistrations.academicYearId, activeYearId) : undefined
        )
      );

    let total_fee = 0, count_fee = 0;
    let total_books = 0, count_books = 0;
    let total_uniform = 0, count_uniform = 0;

    paymentsList.forEach((p) => {
      if (p.paymentType === "fee") {
        total_fee += p.nominal;
        count_fee++;
      } else if (p.paymentType === "books") {
        total_books += p.nominal;
        count_books++;
      } else if (p.paymentType === "uniform") {
        total_uniform += p.nominal;
        count_uniform++;
      }
    });

    return NextResponse.json({
      total_eligible: counts.total,
      total_confirmed: counts.confirmed,
      total_pending: counts.pending,
      total_not_registered: counts.not_registered,
      total_fee,
      count_fee,
      total_books,
      count_books,
      total_uniform,
      count_uniform,
      grand_total: total_fee + total_books + total_uniform,
    });
  } catch (error) {
    console.error("Reregistration Stats GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik pembayaran" },
      { status: 500 }
    );
  }
}
