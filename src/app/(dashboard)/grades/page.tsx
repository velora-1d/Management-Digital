export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { academicYears, classrooms, subjects, curriculums, gradeComponents } from "@/db/schema";
import { isNull, asc, eq, and } from "drizzle-orm";
import GradesClient from "./client";


export default async function GradesPage() {
  const [allAcademicYears, allClassrooms, allSubjects] = await Promise.all([
    db
      .select({
        id: academicYears.id,
        year: academicYears.year,
        isActive: academicYears.isActive,
      })
      .from(academicYears)
      .where(isNull(academicYears.deletedAt))
      .orderBy(asc(academicYears.year))
      .limit(100),
    db
      .select({ id: classrooms.id, name: classrooms.name })
      .from(classrooms)
      .where(isNull(classrooms.deletedAt))
      .orderBy(asc(classrooms.name))
      .limit(200),
    db
      .select({ id: subjects.id, name: subjects.name, code: subjects.code })
      .from(subjects)
      .where(isNull(subjects.deletedAt))
      .orderBy(asc(subjects.name))
      .limit(200),
  ]);

  const activeAY = allAcademicYears.find(y => y.isActive);
  let initialCurriculum = null;
  if (activeAY) {
    const currs = await db
      .select({
        id: curriculums.id,
        type: curriculums.type,
        academicYearId: curriculums.academicYearId,
        semester: curriculums.semester,
        isLocked: curriculums.isLocked,
      })
      .from(curriculums)
      .where(and(eq(curriculums.academicYearId, activeAY.id), eq(curriculums.semester, 'ganjil')))
      .limit(1);

    if (currs.length > 0) {
      const components = await db
        .select({
          id: gradeComponents.id,
          curriculumId: gradeComponents.curriculumId,
          name: gradeComponents.name,
          code: gradeComponents.code,
          type: gradeComponents.type,
          bobot: gradeComponents.bobot,
        })
        .from(gradeComponents)
        .where(eq(gradeComponents.curriculumId, currs[0].id));

      initialCurriculum = {
        ...currs[0],
        gradeComponents: components
      };
    }
  }

  return (
    <GradesClient
      initialAcademicYears={allAcademicYears}
      initialClassrooms={allClassrooms}
      initialSubjects={allSubjects}
      initialCurriculum={initialCurriculum}
    />
  );
}
