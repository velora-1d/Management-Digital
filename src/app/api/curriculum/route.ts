import { NextResponse } from "next/server";
import { db } from "@/db";
import { curriculums, academicYears, gradeComponents } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");
    const semester = searchParams.get("semester");

    const filters = [];
    if (academicYearId) filters.push(eq(curriculums.academicYearId, Number(academicYearId)));
    if (semester) filters.push(eq(curriculums.semester, semester));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const results = await db
      .select({
        id: curriculums.id,
        type: curriculums.type,
        academicYearId: curriculums.academicYearId,
        semester: curriculums.semester,
        isLocked: curriculums.isLocked,
        createdAt: curriculums.createdAt,
        academicYear: {
            id: academicYears.id,
            year: academicYears.year
        }
      })
      .from(curriculums)
      .leftJoin(academicYears, eq(curriculums.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(desc(curriculums.createdAt));

    if (results.length === 0) {
      return NextResponse.json([]);
    }

    // ⚡ Bolt Performance Optimization:
    // Replaced N+1 database queries inside a .map() loop with a single batch fetch using inArray().
    // Impact: Reduces DB round-trips from O(N) to O(1), improving API response time especially with many curriculums.
    const curriculumIds = results.map(cur => cur.id);
    const allComponents = await db
      .select()
      .from(gradeComponents)
      .where(inArray(gradeComponents.curriculumId, curriculumIds));

    // Group the fetched components by curriculumId into a Map for O(1) in-memory lookups
    const componentsByCurriculumId = new Map<number, typeof allComponents>();
    for (const comp of allComponents) {
      if (comp.curriculumId !== null) {
        if (!componentsByCurriculumId.has(comp.curriculumId)) {
          componentsByCurriculumId.set(comp.curriculumId, []);
        }
        componentsByCurriculumId.get(comp.curriculumId)!.push(comp);
      }
    }

    const detailedData = results.map((cur) => ({
      ...cur,
      gradeComponents: componentsByCurriculumId.get(cur.id) || []
    }));

    return NextResponse.json(detailedData);
  } catch (error) {
    console.error("Error fetching curriculums:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, academicYearId, semester, isLocked } = body;

    if (!type || !academicYearId || !semester) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Hindari duplikasi tipe kurikulum per tahun ajaran & semester
    const [existing] = await db
        .select()
        .from(curriculums)
        .where(
            and(
                eq(curriculums.type, type),
                eq(curriculums.academicYearId, academicYearId),
                eq(curriculums.semester, semester)
            )
        )
        .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Curriculum configuration already exists for this period" },
        { status: 400 }
      );
    }

    const [curriculum] = await db
        .insert(curriculums)
        .values({
            type,
            academicYearId,
            semester,
            isLocked: isLocked || false,
        })
        .returning();

    return NextResponse.json(curriculum, { status: 201 });
  } catch (error) {
    console.error("Error creating curriculum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
