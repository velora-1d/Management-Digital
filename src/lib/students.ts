import { db } from "@/db";
import { academicYears, classrooms, studentEnrollments, students } from "@/db/schema";
import { and, asc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";

export async function getStudentsList({
  page = 1,
  limit = 20,
  search = "",
  classroomId = "",
  academicYearId = "",
  gender = "",
  status = "aktif",
  ageMin,
  ageMax,
}: {
  page?: number;
  limit?: number;
  search?: string;
  classroomId?: string;
  academicYearId?: string;
  gender?: string;
  status?: string;
  ageMin?: string | null;
  ageMax?: string | null;
}) {
  let targetAcademicYearId = academicYearId ? Number(academicYearId) : null;

  if (!targetAcademicYearId) {
    const activeYearRes = await db
      .select({ id: academicYears.id })
      .from(academicYears)
      .where(and(eq(academicYears.isActive, true), isNull(academicYears.deletedAt)))
      .limit(1);

    targetAcademicYearId = activeYearRes.length > 0 ? activeYearRes[0].id : null;
  }

  const conditions = [
    isNull(studentEnrollments.deletedAt),
    isNull(students.deletedAt),
  ];

  if (targetAcademicYearId) {
    conditions.push(eq(studentEnrollments.academicYearId, targetAcademicYearId));
  }

  if (classroomId) {
    if (classroomId === "none") {
      conditions.push(isNull(studentEnrollments.classroomId));
    } else {
      conditions.push(eq(studentEnrollments.classroomId, Number(classroomId)));
    }
  }

  if (search) {
    const searchCondition = or(
      ilike(students.name, `%${search}%`),
      ilike(students.nisn, `%${search}%`),
      ilike(students.nis, `%${search}%`)
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (gender) {
    conditions.push(eq(students.gender, gender));
  }

  if (status && status !== "all") {
    conditions.push(eq(students.status, status));
  }

  if (ageMin || ageMax) {
    if (ageMin) {
      const d = new Date();
      const maxDate = new Date(d.getFullYear() - Number(ageMin), d.getMonth(), d.getDate()).toISOString();
      conditions.push(lte(students.birthDate, maxDate));
    }

    if (ageMax) {
      const d = new Date();
      const minDate = new Date(d.getFullYear() - Number(ageMax) - 1, d.getMonth(), d.getDate() + 1).toISOString();
      conditions.push(gte(students.birthDate, minDate));
    }
  }

  const whereClause = and(...conditions);

  const [enrollmentsRes, totalRes] = await Promise.all([
    db
      .select({
        student: {
          id: students.id,
          name: students.name,
          nisn: students.nisn,
          nis: students.nis,
          nik: students.nik,
          gender: students.gender,
          category: students.category,
          status: students.status,
          birthPlace: students.birthPlace,
          birthDate: students.birthDate,
          phone: students.phone,
          address: students.address,
        },
        enrollmentId: studentEnrollments.id,
        enrollmentType: studentEnrollments.enrollmentType,
        classroom: {
          id: classrooms.id,
          name: classrooms.name,
        },
        academicYear: {
          id: academicYears.id,
          year: academicYears.year,
        },
      })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .leftJoin(classrooms, eq(studentEnrollments.classroomId, classrooms.id))
      .leftJoin(academicYears, eq(studentEnrollments.academicYearId, academicYears.id))
      .where(whereClause)
      .orderBy(asc(students.name))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: sql<number>`count(distinct ${students.id})`.mapWith(Number) })
      .from(studentEnrollments)
      .innerJoin(students, eq(studentEnrollments.studentId, students.id))
      .where(whereClause),
  ]);

  const data = enrollmentsRes.map((e) => ({
    ...e.student,
    birthDate: e.student.birthDate
      ? typeof e.student.birthDate === "string"
        ? e.student.birthDate
        : new Date(e.student.birthDate).toISOString()
      : null,
    classroom: e.classroom,
    enrollment: {
      id: e.enrollmentId,
      enrollmentType: e.enrollmentType,
      academicYear: e.academicYear,
    },
  }));

  const total = totalRes[0].count;
  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return {
    data,
    pagination,
    targetAcademicYearId,
  };
}
