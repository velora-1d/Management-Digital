import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { kkms, subjects } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const curriculumId = searchParams.get("curriculumId");
    const subjectId = searchParams.get("subjectId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filters = [];
    if (curriculumId) filters.push(eq(kkms.curriculumId, Number(curriculumId)));
    if (subjectId) filters.push(eq(kkms.subjectId, Number(subjectId)));
    
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [results, totalResult] = await Promise.all([
      db
        .select({
          id: kkms.id,
          nilaiKKM: kkms.nilaiKKM,
          deskripsiKKTP: kkms.deskripsiKKTP,
          curriculumId: kkms.curriculumId,
          subjectId: kkms.subjectId,
          subject: {
            id: subjects.id,
            name: subjects.name
          }
        })
        .from(kkms)
        .leftJoin(subjects, eq(kkms.subjectId, subjects.id))
        .where(whereClause)
        .orderBy(asc(subjects.name))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(kkms)
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
    console.error("Error fetching KKMs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { curriculumId, subjectId, nilaiKKM, deskripsiKKTP } = body;

    if (!curriculumId || !subjectId || nilaiKKM === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert KKM manual with Drizzle
    const [existing] = await db
      .select()
      .from(kkms)
      .where(
        and(
          eq(kkms.curriculumId, Number(curriculumId)),
          eq(kkms.subjectId, Number(subjectId))
        )
      )
      .limit(1);

    let kkm;
    if (existing) {
      const [updated] = await db
        .update(kkms)
        .set({
          nilaiKKM: Number(nilaiKKM),
          deskripsiKKTP: deskripsiKKTP || "",
          updatedAt: new Date(),
        })
        .where(eq(kkms.id, existing.id))
        .returning();
      kkm = updated;
    } else {
      const [created] = await db
        .insert(kkms)
        .values({
          curriculumId: Number(curriculumId),
          subjectId: Number(subjectId),
          nilaiKKM: Number(nilaiKKM),
          deskripsiKKTP: deskripsiKKTP || "",
        })
        .returning();
      kkm = created;
    }

    return NextResponse.json(kkm, { status: 201 });
  } catch (error) {
    console.error("Error upserting KKM:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
