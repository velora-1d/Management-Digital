import { NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears, studentEnrollments, students } from "@/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function GET() {
  try {
    await requireAuth();

    const activeYear = await db
      .select({ id: academicYears.id, year: academicYears.year })
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);

    const activeYearId = activeYear[0]?.id;
    const activeYearLabel = activeYear[0]?.year || "-";

    if (!activeYearId) {
      return NextResponse.json({
        success: true,
        data: {
          activeYear: null,
          summary: {
            nonActiveWithActiveEnrollment: 0,
            duplicateActiveEnrollments: 0,
            classroomMismatch: 0,
            activeStudentsWithoutEnrollment: 0,
          },
          samples: [],
        },
      });
    }

    const [summaryRes, sampleRes] = await Promise.all([
      db.execute(sql`
        with active_enrollments as (
          select se.student_id, se.classroom_id, s.status, s.classroom_id as student_classroom_id
          from ${studentEnrollments} se
          inner join ${students} s on ${students.id} = ${studentEnrollments.studentId}
          where ${studentEnrollments.academicYearId} = ${activeYearId}
            and ${studentEnrollments.deletedAt} is null
            and ${students.deletedAt} is null
        )
        select
          count(*) filter (where status <> 'aktif')::int as non_active_with_active_enrollment,
          (
            select count(*)::int from (
              select student_id
              from active_enrollments
              group by student_id
              having count(*) > 1
            ) d
          ) as duplicate_active_enrollments,
          count(*) filter (where student_classroom_id is distinct from classroom_id)::int as classroom_mismatch,
          (
            select count(*)::int
            from ${students} s
            where s.deleted_at is null
              and s.status = 'aktif'
              and not exists (
                select 1
                from ${studentEnrollments} se
                where se.student_id = s.id
                  and se.academic_year_id = ${activeYearId}
                  and se.deleted_at is null
              )
          ) as active_students_without_enrollment
        from active_enrollments
      `),
      db.execute(sql`
        select
          s.id as student_id,
          s.name as student_name,
          s.status,
          s.classroom_id as student_classroom_id,
          student_cls.name as student_classroom_name,
          se.classroom_id as enrollment_classroom_id,
          enrollment_cls.name as enrollment_classroom_name
        from ${students} s
        left join ${studentEnrollments} se
          on se.student_id = s.id
         and se.academic_year_id = ${activeYearId}
         and se.deleted_at is null
        left join classrooms enrollment_cls on enrollment_cls.id = se.classroom_id
        left join classrooms student_cls on student_cls.id = s.classroom_id
        where s.deleted_at is null
          and (
            (s.status <> 'aktif' and se.id is not null)
            or (s.status = 'aktif' and se.id is null)
            or (se.id is not null and s.classroom_id is distinct from se.classroom_id)
          )
        order by s.name
        limit 20
      `),
    ]);

    const summaryRow = (summaryRes.rows?.[0] ?? {}) as Record<string, number | string | null>;

    return NextResponse.json({
      success: true,
      data: {
        activeYear: {
          id: activeYearId,
          year: activeYearLabel,
        },
        summary: {
          nonActiveWithActiveEnrollment: Number(summaryRow.non_active_with_active_enrollment || 0),
          duplicateActiveEnrollments: Number(summaryRow.duplicate_active_enrollments || 0),
          classroomMismatch: Number(summaryRow.classroom_mismatch || 0),
          activeStudentsWithoutEnrollment: Number(summaryRow.active_students_without_enrollment || 0),
        },
        samples: sampleRes.rows ?? [],
      },
    });
  } catch (error) {
    console.error("Enrollment audit error:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    const message = error instanceof Error ? error.message : "Gagal memuat audit konsistensi siswa";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
