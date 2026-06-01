import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms, studentSavings, studentEnrollments, academicYears } from "@/db/schema";
import { isNull, and, eq, asc, sql, inArray, or, ilike, gte, lte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("classId") || "";
  const query = searchParams.get("q") || "";
  const studentId = searchParams.get("studentId");
  const academicYearId = searchParams.get("academicYearId");
  const semester = searchParams.get("semester");
  const month = searchParams.get("month");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    // Jika request saldo siswa tertentu → return balance langsung
    if (studentId) {
      const [{ savingsIn }] = await db.select({
        savingsIn: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number)
      }).from(studentSavings).where(and(eq(studentSavings.studentId, Number(studentId)), eq(studentSavings.type, "setor"), eq(studentSavings.status, "active"), isNull(studentSavings.deletedAt)));

      const [{ savingsOut }] = await db.select({
        savingsOut: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number)
      }).from(studentSavings).where(and(eq(studentSavings.studentId, Number(studentId)), eq(studentSavings.type, "tarik"), eq(studentSavings.status, "active"), isNull(studentSavings.deletedAt)));

      const balance = savingsIn - savingsOut;
      return NextResponse.json({ success: true, balance });
    }

    // 1. Tentukan Tahun Ajaran
    let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (!targetAcademicYearId) {
      const activeYearRes = await db.select({ id: academicYears.id })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);
      targetAcademicYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;
    }

    if (targetAcademicYearId) {
      const ay = await db.query.academicYears.findFirst({
        where: eq(academicYears.id, targetAcademicYearId)
      });
      if (ay) {
        startDate = ay.startDate ? new Date(ay.startDate) : null;
        endDate = ay.endDate ? new Date(ay.endDate) : null;

        if (semester === "Ganjil") {
          endDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 0) : endDate;
        } else if (semester === "Genap") {
          startDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 6, 1) : startDate;
        }

        if (month && month !== "Semua Bulan") {
          const monthIndex = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].indexOf(month);
          if (monthIndex !== -1) {
            let year = startDate ? startDate.getFullYear() : new Date().getFullYear();
            if (monthIndex < 6 && startDate && startDate.getMonth() >= 6) year++;
            else if (monthIndex >= 6 && startDate && startDate.getMonth() < 6) year--;
            startDate = new Date(year, monthIndex, 1);
            endDate = new Date(year, monthIndex + 1, 0);
          }
        }
      }
    }

    // 2. Build where clause untuk siswa berdasarkan pendaftaran (Enrollment)
    const conditions = [
      isNull(studentEnrollments.deletedAt),
      isNull(students.deletedAt),
      eq(students.status, "aktif")
    ];

    if (targetAcademicYearId) {
      conditions.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
    }

    if (classFilter) {
      conditions.push(eq(studentEnrollments.classroomId, Number(classFilter)));
    }

    if (query) {
      conditions.push(or(
        ilike(students.name, `%${query}%`),
        ilike(students.nisn, `%${query}%`)
      )!);
    }

    const whereClause = and(...conditions);

    // 3. Fetch data list dan total global balance
    const [enrollmentsRes, totalRes, totalBalanceRes] = await Promise.all([
      db.select({
        id: students.id,
        name: students.name,
        nisn: students.nisn,
        classroomName: classrooms.name,
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
      .where(whereClause)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .where(whereClause),

      // Hitung total balance global (untuk filter saat ini)
      db.select({
        type: studentSavings.type,
        total: sql<number>`sum(${studentSavings.amount})`.mapWith(Number)
      })
      .from(studentSavings)
      .innerJoin(studentEnrollments, eq(studentSavings.studentId, studentEnrollments.studentId))
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .where(and(
        whereClause,
        eq(studentSavings.status, "active"),
        isNull(studentSavings.deletedAt),
        startDate && endDate ? gte(studentSavings.date, startDate.toISOString().split("T")[0]) : undefined,
        startDate && endDate ? lte(studentSavings.date, endDate.toISOString().split("T")[0]) : undefined
      ))
      .groupBy(studentSavings.type)
    ]);

    const studentList = enrollmentsRes;
    const total = totalRes[0].count;

    let globalTotalBalance = 0;
    totalBalanceRes.forEach(b => {
      if (b.type === "setor") globalTotalBalance += b.total;
      else if (b.type === "tarik") globalTotalBalance -= b.total;
    });

    // Hitung saldo per siswa (untuk halaman ini) via SQL groupBy
    const studentIds = studentList.map(s => s.id);

    let balances: { studentId: number | null; type: string; total: number }[] = [];
    if (studentIds.length > 0) {
      balances = await db.select({
        studentId: studentSavings.studentId,
        type: studentSavings.type,
        total: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number),
      })
      .from(studentSavings)
      .where(and(
        inArray(studentSavings.studentId, studentIds),
        isNull(studentSavings.deletedAt),
        eq(studentSavings.status, "active")
      ))
      .groupBy(studentSavings.studentId, studentSavings.type);
    }

    const balanceMap: Record<number, number> = {};
    balances.forEach(b => {
      if (b.studentId == null) return;
      if (!balanceMap[b.studentId]) balanceMap[b.studentId] = 0;
      if (b.type === "setor") {
        balanceMap[b.studentId] += b.total;
      } else if (b.type === "tarik") {
        balanceMap[b.studentId] -= b.total;
      }
    });

    const data = studentList.map(s => ({
      id: s.id,
      name: s.name,
      nisn: s.nisn,
      classroom: s.classroomName || "-",
      balance: balanceMap[s.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      data,
      totalBalance: globalTotalBalance,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Tabungan GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
