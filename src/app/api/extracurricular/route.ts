import { NextResponse } from "next/server";
import { db } from "@/db";
import { extracurriculars, employees, extracurricularMembers, students } from "@/db/schema";
import { eq, and, isNull, asc, sql, inArray } from "drizzle-orm";

// GET /api/extracurricular
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = isNull(extracurriculars.deletedAt);

    const [results, totalResult] = await Promise.all([
      db
        .select({
          id: extracurriculars.id,
          name: extracurriculars.name,
          employeeId: extracurriculars.employeeId,
          schedule: extracurriculars.schedule,
          status: extracurriculars.status,
          createdAt: extracurriculars.createdAt,
          employeeName: employees.name,
        })
        .from(extracurriculars)
        .leftJoin(employees, eq(extracurriculars.employeeId, employees.id))
        .where(whereClause)
        .orderBy(asc(extracurriculars.name))
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(extracurriculars)
        .where(whereClause)
    ]);

    const total = totalResult[0]?.count || 0;

    // ⚡ Bolt Performance Optimization:
    // Replaced N+1 Promise.all().map() queries with a single O(1) batch query
    // using inArray() and an in-memory Map for efficient correlation.
    const extracurricularIds = results.map((item) => item.id);
    const allMembers = extracurricularIds.length > 0
      ? await db
          .select({
              id: extracurricularMembers.id,
              extracurricularId: extracurricularMembers.extracurricularId,
              student: {
                  id: students.id,
                  name: students.name,
                  nisn: students.nisn
              }
          })
          .from(extracurricularMembers)
          .leftJoin(students, eq(extracurricularMembers.studentId, students.id))
          .where(inArray(extracurricularMembers.extracurricularId, extracurricularIds))
      : [];

    type MemberType = Omit<typeof allMembers[number], "extracurricularId">;
    const membersMap = new Map<number, MemberType[]>();

    for (const m of allMembers) {
      if (m.extracurricularId !== null) {
        if (!membersMap.has(m.extracurricularId)) {
          membersMap.set(m.extracurricularId, []);
        }
        membersMap.get(m.extracurricularId)!.push({
          id: m.id,
          student: m.student
        });
      }
    }

    const detailedData = results.map(item => ({
        ...item,
        employee: item.employeeId ? { id: item.employeeId, name: item.employeeName } : null,
        members: membersMap.get(item.id) || []
    }));

    return NextResponse.json({
      success: true,
      data: detailedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat data ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/extracurricular
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, employeeId, schedule, status } = body;
    if (!name) return NextResponse.json({ error: "Nama ekskul wajib diisi" }, { status: 400 });

    const [data] = await db
      .insert(extracurriculars)
      .values({
        name,
        employeeId: employeeId ? parseInt(employeeId) : null,
        schedule: schedule || "",
        status: status || "aktif",
      })
      .returning();

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
