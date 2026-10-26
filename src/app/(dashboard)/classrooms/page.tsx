export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import { db } from "@/db";
import { academicYears, employees } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import ClassroomsClient, { type InitialResult } from "./client";
import { getClassroomsList } from "@/lib/classrooms";

export default async function ClassroomsPage() {
  const cookieStore = await cookies();
  const activeLevelCookie = cookieStore.get("active_school_level_id")?.value;
  const schoolLevelId = activeLevelCookie ? Number(activeLevelCookie) : 1;

  const limit = 10;
  const fallbackResult: InitialResult = {
    data: [],
    pagination: { page: 1, limit, total: 0, totalPages: 1 },
  };

  let initialResult = fallbackResult;
  let allAcademicYears: { id: number; year: string; isActive: boolean }[] = [];
  let allTeachers: { id: number; name: string }[] = [];

  try {
    // Prefetch server-side untuk first paint sesuai jenjang aktif
    const [classroomsResult, academicYearsResult, teachersResult] = await Promise.all([
      getClassroomsList({ page: 1, limit, schoolLevelId }),
      db
        .select({ id: academicYears.id, year: academicYears.year, isActive: academicYears.isActive })
        .from(academicYears)
        .where(isNull(academicYears.deletedAt))
        .orderBy(asc(academicYears.year))
        .limit(100),
      db
        .select({ id: employees.id, name: employees.name })
        .from(employees)
        .where(isNull(employees.deletedAt))
        .orderBy(asc(employees.name))
        .limit(100),
    ]);

    initialResult = classroomsResult || fallbackResult;
    allAcademicYears = academicYearsResult;
    allTeachers = teachersResult;
  } catch (error) {
    console.error("ClassroomsPage preload failed:", error);
  }

  return (
    <ClassroomsClient
      initialResult={initialResult as InitialResult}
      initialAcademicYears={allAcademicYears}
      initialTeachers={allTeachers}
    />
  );
}
