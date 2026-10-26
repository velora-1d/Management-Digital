export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { classrooms, academicYears } from "@/db/schema";
import { isNull, asc, and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import AttendanceClient from "./client";

export default async function AttendancePage() {
  const cookieStore = await cookies();
  const activeLevelCookie = cookieStore.get("active_school_level_id")?.value;
  const activeSchoolLevelId = activeLevelCookie ? Number(activeLevelCookie) : 1;

  const [allClassrooms, allAcademicYears] = await Promise.all([
    db
      .select({ id: classrooms.id, name: classrooms.name, level: classrooms.level })
      .from(classrooms)
      .where(and(isNull(classrooms.deletedAt), eq(classrooms.schoolLevelId, activeSchoolLevelId)))
      .orderBy(asc(classrooms.name))
      .limit(200),
    db
      .select({ id: academicYears.id, year: academicYears.year, isActive: academicYears.isActive })
      .from(academicYears)
      .where(isNull(academicYears.deletedAt))
      .orderBy(asc(academicYears.year))
      .limit(50),
  ]);

  const activeAY = allAcademicYears.find((ay) => ay.isActive) ?? null;

  return (
    <AttendanceClient
      initialClassrooms={allClassrooms.map((c) => ({ ...c, level: String(c.level) }))}
      initialActiveAY={activeAY}
    />
  );
}
