import { NextResponse } from "next/server";
import { db } from "@/db";
import { extracurriculars, employees, extracurricularMembers, students } from "@/db/schema";
import { eq, isNull, asc, sql, inArray } from "drizzle-orm";

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

    // Bolt Optimization: Eliminated N+1 query vulnerability by pre-fetching
    // all extracurricular members in a single query using 'inArray', mapping
    // them to O(1) in-memory Map lookups.
    const itemIds = results.map(r => r.id);
    let allMembers: {
      extracurricularId: number | null;
      id: number;
      student: { id: number; name: string; nisn: string | null; } | null
    }[] = [];

    if (itemIds.length > 0) {
        allMembers = await db
            .select({
                extracurricularId: extracurricularMembers.extracurricularId,
                id: extracurricularMembers.id,
                student: {
                    id: students.id,
                    name: students.name,
                    nisn: students.nisn
                }
            })
            .from(extracurricularMembers)
            .leftJoin(students, eq(extracurricularMembers.studentId, students.id))
            .where(inArray(extracurricularMembers.extracurricularId, itemIds));
    }

    const membersMap = new Map<number, typeof allMembers>();
    for (const m of allMembers) {
        if (m.extracurricularId !== null) {
            if (!membersMap.has(m.extracurricularId)) {
                membersMap.set(m.extracurricularId, []);
            }
            membersMap.get(m.extracurricularId)!.push(m);
        }
    }

    const detailedData = results.map((item) => {
        const members = membersMap.get(item.id) || [];
        return {
            ...item,
            employee: item.employeeId ? { id: item.employeeId, name: item.employeeName } : null,
            members: members.map(m => ({ id: m.id, student: m.student }))
        };
    });

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
