import { NextResponse } from "next/server";
import { db } from "@/db";
import { studentGrades, students } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const componentId = searchParams.get("componentId");
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");

    let whereClause = undefined;
    const filters = [];
    if (componentId) filters.push(eq(studentGrades.componentId, Number(componentId)));
    if (classroomId) filters.push(eq(studentGrades.classroomId, Number(classroomId)));
    if (subjectId) filters.push(eq(studentGrades.subjectId, Number(subjectId)));
    
    if (filters.length > 0) whereClause = and(...filters);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const [results, totalResult] = await Promise.all([
      db
        .select({
          id: studentGrades.id,
          nilaiAngka: studentGrades.nilaiAngka,
          predikat: studentGrades.predikat,
          componentId: studentGrades.componentId,
          studentId: studentGrades.studentId,
          subjectId: studentGrades.subjectId,
          classroomId: studentGrades.classroomId,
          student: {
            id: students.id,
            name: students.name,
            nis: students.nis,
            nisn: students.nisn
          }
        })
        .from(studentGrades)
        .leftJoin(students, eq(studentGrades.studentId, students.id))
        .where(whereClause)
        .orderBy(asc(students.name))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(studentGrades)
        .where(whereClause)
    ]);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { componentId, classroomId, subjectId, grades } = body;

    if (!componentId || !classroomId || !subjectId || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: "Missing required fields or grades array" },
        { status: 400 }
      );
    }

    const savedGrades = [];
    for (const g of grades) {
        // Upsert manual with Drizzle
        const [existing] = await db
            .select()
            .from(studentGrades)
            .where(
                and(
                    eq(studentGrades.componentId, Number(componentId)),
                    eq(studentGrades.studentId, Number(g.studentId)),
                    eq(studentGrades.subjectId, Number(subjectId))
                )
            )
            .limit(1);
        
        if (existing) {
            const [updated] = await db
                .update(studentGrades)
                .set({
                    classroomId: Number(classroomId),
                    nilaiAngka: Number(g.nilaiAngka),
                    predikat: g.predikat || "",
                    updatedAt: new Date(),
                })
                .where(eq(studentGrades.id, existing.id))
                .returning();
            savedGrades.push(updated);
        } else {
            const [created] = await db
                .insert(studentGrades)
                .values({
                    componentId: Number(componentId),
                    studentId: Number(g.studentId),
                    subjectId: Number(subjectId),
                    classroomId: Number(classroomId),
                    nilaiAngka: Number(g.nilaiAngka),
                    predikat: g.predikat || "",
                })
                .returning();
            savedGrades.push(created);
        }
    }

    return NextResponse.json({ success: true, count: savedGrades.length }, { status: 201 });
  } catch (error) {
    console.error("Error upserting grades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
