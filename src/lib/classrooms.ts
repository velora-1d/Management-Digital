import { db } from "@/db";
import { academicYears, classrooms, employees, studentEnrollments, students } from "@/db/schema";
import { and, asc, eq, ilike, isNull, sql } from "drizzle-orm";

export async function getClassroomsList({
  page = 1,
  limit = 10,
  q = "",
  academicYearId,
}: {
  page?: number;
  limit?: number;
  q?: string;
  academicYearId?: number | null;
}) {
  const skip = (page - 1) * limit;
  const conditions = [isNull(classrooms.deletedAt)];

  if (q) {
    conditions.push(ilike(classrooms.name, `%${q}%`));
  }

  // Filter per tahun ajaran jika disediakan
  if (academicYearId) {
    conditions.push(eq(classrooms.academicYearId, academicYearId));
  }

  const whereClause = and(...conditions);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: classrooms.id,
        level: classrooms.level,
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
      .leftJoin(
        studentEnrollments,
        and(
          eq(classrooms.id, studentEnrollments.classroomId),
          eq(classrooms.academicYearId, studentEnrollments.academicYearId),
          isNull(studentEnrollments.deletedAt)
        )
      )
      .leftJoin(
        students,
        and(
          eq(studentEnrollments.studentId, students.id),
          isNull(students.deletedAt),
          eq(students.status, "aktif")
        )
      )
      .where(whereClause)
      .groupBy(
        classrooms.id,
        classrooms.level,
        classrooms.name,
        classrooms.academicYearId,
        classrooms.waliKelasId,
        classrooms.infaqNominal,
        academicYears.year,
        employees.name
      )
      .orderBy(asc(classrooms.level), asc(classrooms.name))
      .limit(limit)
      .offset(skip),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(classrooms)
      .where(whereClause),
  ]);

  const data = rows.map((cls) => ({
    id: cls.id,
    level: cls.level,
    name: cls.name,
    academicYearId: cls.academicYearId,
    academicYear: cls.academicYear || "-",
    waliKelasId: cls.waliKelasId,
    waliKelas: cls.waliKelas || "-",
    infaqNominal: cls.infaqNominal || 0,
    student_count: cls.student_count,
  }));

  const pagination = {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
  };

  return { data, pagination };
}
