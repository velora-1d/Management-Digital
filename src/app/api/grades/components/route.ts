import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gradeComponents } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const curriculumId = searchParams.get("curriculumId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    let whereClause = undefined;
    if (curriculumId) whereClause = eq(gradeComponents.curriculumId, Number(curriculumId));

    const [results, totalResult] = await Promise.all([
      db
        .select()
        .from(gradeComponents)
        .where(whereClause)
        .orderBy(asc(gradeComponents.urutan))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(gradeComponents)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching grade components:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { curriculumId, name, code, type, formatNilai, bobot, urutan, isWajib } = body;

    if (!curriculumId || !name || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [component] = await db
      .insert(gradeComponents)
      .values({
        curriculumId,
        name,
        code,
        type: type || "pengetahuan",
        formatNilai: formatNilai || "angka",
        bobot: bobot || 0,
        urutan: urutan || 1,
        isWajib: isWajib ?? true,
      })
      .returning();

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error("Error creating grade component:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
