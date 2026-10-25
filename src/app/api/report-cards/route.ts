import { NextResponse } from "next/server";
import { db } from "@/db";
import { reportCards, students, classrooms, curriculums } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

// GET /api/report-cards?classroomId=X&curriculumId=Y&semester=ganjil
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const curriculumId = searchParams.get("curriculumId");
    const semester = searchParams.get("semester");

    const filters = [];
    if (classroomId) filters.push(eq(reportCards.classroomId, parseInt(classroomId)));
    if (curriculumId) filters.push(eq(reportCards.curriculumId, parseInt(curriculumId)));
    if (semester) filters.push(eq(reportCards.semester, semester));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    const [results, totalResult] = await Promise.all([
      db
        .select({
          id: reportCards.id,
          studentId: reportCards.studentId,
          classroomId: reportCards.classroomId,
          curriculumId: reportCards.curriculumId,
          semester: reportCards.semester,
          status: reportCards.status,
          ranking: reportCards.ranking,
          totalSiswa: reportCards.totalSiswa,
          catatanWali: reportCards.catatanWali,
          attendanceAtititude: reportCards.attendanceAtititude,
          updatedAt: reportCards.updatedAt,
          student: {
            id: students.id,
            name: students.name,
            nisn: students.nisn,
            nis: students.nis
          },
          classroom: {
            id: classrooms.id,
            name: classrooms.name
          },
          curriculum: {
            id: curriculums.id,
            type: curriculums.type,
            semester: curriculums.semester
          }
        })
        .from(reportCards)
        .leftJoin(students, eq(reportCards.studentId, students.id))
        .leftJoin(classrooms, eq(reportCards.classroomId, classrooms.id))
        .leftJoin(curriculums, eq(reportCards.curriculumId, curriculums.id))
        .where(whereClause)
        .orderBy(asc(students.name))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(reportCards)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Report cards GET error:", error);
    const message = error instanceof Error ? error.message : "Gagal memuat data rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/report-cards — Upsert report card (DRAFT)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentIds, classroomId, curriculumId, semester } = body;

    if (!studentIds?.length || !classroomId || !curriculumId || !semester) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const results = [];
    for (const studentId of studentIds) {
      // Upsert manual with Drizzle
      const [existing] = await db
        .select()
        .from(reportCards)
        .where(
          and(
            eq(reportCards.studentId, parseInt(studentId)),
            eq(reportCards.curriculumId, parseInt(curriculumId)),
            eq(reportCards.semester, semester)
          )
        )
        .limit(1);

      if (existing) {
        results.push(existing);
      } else {
        const [created] = await db
          .insert(reportCards)
          .values({
            studentId: parseInt(studentId),
            classroomId: parseInt(classroomId),
            curriculumId: parseInt(curriculumId),
            semester,
            status: "DRAFT",
          })
          .returning();
        results.push(created);
      }
    }

    return NextResponse.json({ count: results.length, data: results });
  } catch (error: unknown) {
    console.error("Report cards POST error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat rapor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
