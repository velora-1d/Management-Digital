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

    // Fetch members for each extracurricular (optional, but original include had it)
    // To be efficient, we do separate fetch or join
    // But original logic had nested include, let's just return what we have or do a separate fetch for details
    
    // Original had include for members.student too.
    // For simplicity and efficiency, maybe we fetch members separately if needed
    // But let's follow original structure where possible
    // ⚡ Bolt: Performance Optimization
    // Replaced an N+1 query problem with a batch fetch.
    // Instead of querying 'extracurricularMembers' for each item inside a Promise.all() map,
    // we fetch all relevant members in a single query using 'inArray'.
    // This reduces the number of database queries from N+2 to exactly 3.
    const extracurricularIds = results.map(r => r.id);
    let allMembers: any[] = [];

    if (extracurricularIds.length > 0) {
      allMembers = await db
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
        .where(inArray(extracurricularMembers.extracurricularId, extracurricularIds));
    }

    // Group members by extracurricularId in memory for O(1) lookup
    const membersMap = new Map<number, any[]>();
    for (const member of allMembers) {
      if (!membersMap.has(member.extracurricularId)) {
        membersMap.set(member.extracurricularId, []);
      }
      membersMap.get(member.extracurricularId)!.push({
        id: member.id,
        student: member.student
      });
    }

    const detailedData = results.map((item) => {
        const members = membersMap.get(item.id) || [];
        
        return {
            ...item,
            employee: item.employeeId ? { id: item.employeeId, name: item.employeeName } : null,
            members
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
