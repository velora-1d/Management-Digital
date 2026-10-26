export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { classrooms, curriculums } from "@/db/schema";
import { isNull, asc, and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import ReportCardsClient from "./client";

export default async function ReportCardsPage() {
  const cookieStore = await cookies();
  const activeLevelCookie = cookieStore.get("active_school_level_id")?.value;
  const activeSchoolLevelId = activeLevelCookie ? Number(activeLevelCookie) : 1;

  const [allClassrooms, allCurriculums] = await Promise.all([
    db
      .select({ id: classrooms.id, name: classrooms.name, level: classrooms.level })
      .from(classrooms)
      .where(and(isNull(classrooms.deletedAt), eq(classrooms.schoolLevelId, activeSchoolLevelId)))
      .orderBy(asc(classrooms.name))
      .limit(200),
    db
      .select({
        id: curriculums.id,
        type: curriculums.type,
        semester: curriculums.semester,
        academicYearId: curriculums.academicYearId,
      })
      .from(curriculums)
      .orderBy(asc(curriculums.id))
      .limit(50),
  ]);

  return (
    <ReportCardsClient
      initialClassrooms={allClassrooms}
      initialCurriculums={allCurriculums}
    />
  );
}
