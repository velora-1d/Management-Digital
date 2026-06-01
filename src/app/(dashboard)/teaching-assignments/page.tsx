export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { teachingAssignments, employees, subjects, classrooms, academicYears } from "@/db/schema";
import { isNull, eq, desc, sql } from "drizzle-orm";
import TeachingAssignmentsClient from "./client";
import type { ComponentProps } from "react";

export default async function TeachingAssignmentsPage() {
  const limit = 10;

  // Ambil data paralel: tugas mengajar page-1 + semua dropdown metadata
  const [initialData, [{ total }], allTeachers, allSubjects, allClassrooms, allAcademicYears] =
    await Promise.all([
      db
        .select({
          id: teachingAssignments.id,
          employeeId: teachingAssignments.employeeId,
          subjectId: teachingAssignments.subjectId,
          classroomId: teachingAssignments.classroomId,
          academicYearId: teachingAssignments.academicYearId,
          employee: { name: employees.name },
          subject: { name: subjects.name, code: subjects.code },
          classroom: { name: classrooms.name },
          academicYear: { year: academicYears.year, isActive: academicYears.isActive },
        })
        .from(teachingAssignments)
        .leftJoin(employees, eq(teachingAssignments.employeeId, employees.id))
        .leftJoin(subjects, eq(teachingAssignments.subjectId, subjects.id))
        .leftJoin(classrooms, eq(teachingAssignments.classroomId, classrooms.id))
        .leftJoin(academicYears, eq(teachingAssignments.academicYearId, academicYears.id))
        .where(isNull(teachingAssignments.deletedAt))
        .orderBy(desc(teachingAssignments.createdAt))
        .limit(limit)
        .offset(0),
      db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(teachingAssignments)
        .where(isNull(teachingAssignments.deletedAt)),
      db.select({ id: employees.id, name: employees.name }).from(employees).where(isNull(employees.deletedAt)).limit(1000),
      db.select({ id: subjects.id, name: subjects.name, code: subjects.code }).from(subjects).where(isNull(subjects.deletedAt)).limit(500),
      db.select({ id: classrooms.id, name: classrooms.name }).from(classrooms).where(isNull(classrooms.deletedAt)).limit(100),
      db.select({ id: academicYears.id, year: academicYears.year, isActive: academicYears.isActive }).from(academicYears).where(isNull(academicYears.deletedAt)).limit(50),
    ]);

  const initialResult: NonNullable<ComponentProps<typeof TeachingAssignmentsClient>["initialResult"]> = {
    data: initialData,
    pagination: { page: 1, limit, total, totalPages: Math.ceil(total / limit) },
  };

  // Academic years butuh field 'name' untuk DropdownItem interface di client
  const allAcademicYearsFormatted = allAcademicYears.map((y) => ({
    ...y,
    name: y.year, // alias agar cocok dengan DropdownItem { id, name }
    semester: undefined as string | undefined,
  }));

  return (
    <TeachingAssignmentsClient
      initialResult={initialResult}
      initialTeachers={allTeachers}
      initialSubjects={allSubjects.map(s => ({ ...s, type: undefined as string | undefined }))}
      initialClassrooms={allClassrooms}
      initialAcademicYears={allAcademicYearsFormatted}
    />
  );
}
