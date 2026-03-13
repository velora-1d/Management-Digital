import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, classrooms, studentSavings } from "@/db/schema";
import { isNull, and, eq, asc, sql, inArray } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classFilter = searchParams.get("classId") || "";
  const studentId = searchParams.get("studentId");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    // Jika request saldo siswa tertentu → return balance langsung
    if (studentId) {
      const [{ savingsIn }] = await db.select({
        savingsIn: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number)
      }).from(studentSavings).where(and(eq(studentSavings.studentId, Number(studentId)), eq(studentSavings.type, "setor" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

      const [{ savingsOut }] = await db.select({
        savingsOut: sql<number>`coalesce(sum(${studentSavings.amount}), 0)`.mapWith(Number)
      }).from(studentSavings).where(and(eq(studentSavings.studentId, Number(studentId)), eq(studentSavings.type, "tarik" as any), eq(studentSavings.status, "active" as any), isNull(studentSavings.deletedAt)));

      const balance = savingsIn - savingsOut;
      return NextResponse.json({ success: true, balance });
    }

    // Build where clause untuk siswa
    const studentConditions = [isNull(students.deletedAt), eq(students.status, "aktif" as any)];
    if (classFilter) studentConditions.push(eq(students.classroomId, Number(classFilter)));
    const studentWhere = and(...studentConditions);

    const [studentList, [{ total }]] = await Promise.all([
      db.select({
        id: students.id,
        name: students.name,
        nisn: students.nisn,
        classroomName: classrooms.name,
      })
      .from(students)
      .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
      .where(studentWhere)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(students)
      .where(studentWhere)
    ]);

    // Hitung saldo via SQL groupBy
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
        eq(studentSavings.status, "active" as any)
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Tabungan GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
