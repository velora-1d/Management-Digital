export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { classrooms, academicYears, subjects, employees } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import ScheduleClient from "./client";

export default async function SchedulePage() {
  // Jadwal tidak di-pre-load karena memerlukan filter classroom + academicYear dulu.
  // Yang di-prefetch hanya metadata dropdown (classrooms, academicYears, subjects, employees)
  // sehingga dropdown terisi instan tanpa fetching dari browser.
  const [allClassrooms, allAcademicYears, allSubjects, allEmployees] = await Promise.all([
    db
      .select({ id: classrooms.id, name: classrooms.name })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt))
      .orderBy(asc(classrooms.name))
      .limit(100),
    db
      .select({ id: academicYears.id, year: academicYears.year, isActive: academicYears.isActive })
      .from(academicYears)
      .where(isNull(academicYears.deletedAt))
      .orderBy(asc(academicYears.year))
      .limit(50),
    db
      .select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(isNull(subjects.deletedAt))
      .orderBy(asc(subjects.name))
      .limit(500),
    db
      .select({ id: employees.id, name: employees.name })
      .from(employees)
      .where(isNull(employees.deletedAt))
      .orderBy(asc(employees.name))
      .limit(200),
  ]);

  return (
    <ScheduleClient
      initialClassrooms={allClassrooms}
      initialAcademicYears={allAcademicYears}
      initialSubjects={allSubjects}
      initialEmployees={allEmployees}
    />
  );
}
