import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, studentEnrollments, students } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { and, eq, isNull, sql } from "drizzle-orm";
import crypto from "crypto";

function getDatabaseMeta() {
  const rawUrl = process.env.DATABASE_URL || "";

  if (!rawUrl) {
    return {
      hasDatabaseUrl: false,
      host: null,
      database: null,
      fingerprint: null,
    };
  }

  try {
    const parsed = new URL(rawUrl);
    const fingerprint = crypto
      .createHash("sha256")
      .update(rawUrl)
      .digest("hex")
      .slice(0, 12);

    return {
      hasDatabaseUrl: true,
      host: parsed.hostname || null,
      database: parsed.pathname.replace(/^\//, "") || null,
      fingerprint,
    };
  } catch {
    return {
      hasDatabaseUrl: true,
      host: "unparsed",
      database: null,
      fingerprint: crypto.createHash("sha256").update(rawUrl).digest("hex").slice(0, 12),
    };
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    let targetAcademicYearId = searchParams.get("academicYearId")
      ? Number(searchParams.get("academicYearId"))
      : null;

    if (!targetAcademicYearId) {
      const [activeYear] = await db
        .select({ id: academicYears.id, year: academicYears.year })
        .from(academicYears)
        .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
        .limit(1);

      targetAcademicYearId = activeYear?.id || null;
    }

    const [activeYear, dashboardCount, rawEnrollmentCount, rawStudentCount, perClassRows] =
      await Promise.all([
        targetAcademicYearId
          ? db
              .select({ id: academicYears.id, year: academicYears.year, isActive: academicYears.isActive })
              .from(academicYears)
              .where(eq(academicYears.id, targetAcademicYearId))
              .limit(1)
          : Promise.resolve([]),
        db
          .select({
            total: sql<number>`count(distinct ${students.id})`.mapWith(Number),
          })
          .from(studentEnrollments)
          .innerJoin(students, eq(studentEnrollments.studentId, students.id))
          .where(
            and(
              isNull(studentEnrollments.deletedAt),
              isNull(students.deletedAt),
              eq(students.status, "aktif"),
              targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined
            )
          ),
        db
          .select({
            total: sql<number>`count(*)`.mapWith(Number),
          })
          .from(studentEnrollments)
          .where(
            and(
              isNull(studentEnrollments.deletedAt),
              targetAcademicYearId ? eq(studentEnrollments.academicYearId, targetAcademicYearId) : undefined
            )
          ),
        db
          .select({
            total: sql<number>`count(*)`.mapWith(Number),
          })
          .from(students)
          .where(and(isNull(students.deletedAt), eq(students.status, "aktif"))),
        db.execute(sql`
          with target_year as (
            select ${targetAcademicYearId}::int as id
          )
          select
            c.id,
            c.name,
            c.academic_year_id,
            count(distinct s.id)::int as student_count
          from classrooms c
          left join student_enrollments se
            on se.classroom_id = c.id
           and se.academic_year_id = c.academic_year_id
           and se.deleted_at is null
          left join students s
            on s.id = se.student_id
           and s.deleted_at is null
           and s.status = 'aktif'
          join target_year ty on ty.id = c.academic_year_id
          where c.deleted_at is null
          group by c.id, c.name, c.academic_year_id
          order by c.name
        `),
      ]);

    const response = NextResponse.json({
      success: true,
      data: {
        runtime: {
          nodeEnv: process.env.NODE_ENV || null,
          appName: process.env.NEXT_PUBLIC_APP_NAME || null,
          ...getDatabaseMeta(),
        },
        auth: {
          userId: user.userId,
          role: user.role,
        },
        filters: {
          academicYearId: targetAcademicYearId,
        },
        counts: {
          dashboardStudentCount: dashboardCount[0]?.total || 0,
          activeStudentTableCount: rawStudentCount[0]?.total || 0,
          activeEnrollmentRowCount: rawEnrollmentCount[0]?.total || 0,
        },
        academicYear: activeYear[0] || null,
        classrooms: perClassRows.rows ?? [],
      },
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Runtime students debug error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Gagal memuat debug runtime" },
      { status: 500 }
    );
  }
}
