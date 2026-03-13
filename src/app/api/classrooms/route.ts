import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classrooms, academicYears, employees, students } from "@/db/schema";
import { eq, or, and, isNull, asc, ilike, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const conditions = [isNull(classrooms.deletedAt)];
    if (q) {
      conditions.push(or(
        ilike(classrooms.name, `%${q}%`)
      )!);
    }

    const whereClause = and(...conditions);

    const [classroomsData, [{ count }]] = await Promise.all([
      db.select({
        id: classrooms.id,
        name: classrooms.name,
        academicYearId: classrooms.academicYearId,
        academicYear: academicYears.year,
        waliKelasId: classrooms.waliKelasId,
        waliKelas: employees.name,
        infaqNominal: classrooms.infaqNominal,
        student_count: sql<number>`count(distinct ${students.id})`.mapWith(Number),
      })
      .from(classrooms)
      .leftJoin(academicYears, eq(classrooms.academicYearId, academicYears.id))
      .leftJoin(employees, eq(classrooms.waliKelasId, employees.id))
      .leftJoin(students, and(
        eq(classrooms.id, students.classroomId),
        isNull(students.deletedAt)
      ))
      .where(whereClause)
      .groupBy(classrooms.id, academicYears.year, employees.name)
      .orderBy(asc(classrooms.name))
      .limit(limit)
      .offset(skip),
      
      db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(classrooms)
      .where(whereClause)
    ]);

    const classroomsWithCount = classroomsData.map((cls) => ({
      id: cls.id,
      name: cls.name,
      academicYearId: cls.academicYearId,
      academicYear: cls.academicYear || "-",
      waliKelasId: cls.waliKelasId,
      waliKelas: cls.waliKelas || "-",
      infaqNominal: cls.infaqNominal || 0,
      student_count: cls.student_count,
    }));

    return NextResponse.json(
      { 
        success: true, 
        data: classroomsWithCount,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
