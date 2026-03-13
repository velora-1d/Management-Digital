import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { isNull, and, eq, or, ilike, asc, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const unitId = searchParams.get('unitId');
    const q = searchParams.get('q') || "";
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const conditions = [isNull(subjects.deletedAt)];
    if (type) conditions.push(eq(subjects.type, type as any));
    if (status) conditions.push(eq(subjects.status, status as any));
    if (unitId) conditions.push(eq(subjects.unitId, unitId));
    if (q) {
      conditions.push(or(
        ilike(subjects.name, `%${q}%`),
        ilike(subjects.code, `%${q}%`)
      )!);
    }

    const whereClause = and(...conditions);

    const [data, [{ total }]] = await Promise.all([
      db.select().from(subjects).where(whereClause).orderBy(asc(subjects.name)).limit(limit).offset(skip),
      db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(subjects).where(whereClause)
    ]);

    return NextResponse.json(
      { 
        success: true, 
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, type, tingkatKelas, unitId } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
    }

    const [newSubject] = await db.insert(subjects).values({
      name,
      code: code || '',
      type: (type as any) || 'wajib',
      tingkatKelas: tingkatKelas || '',
      unitId: unitId || '',
      status: 'aktif',
    }).returning();

    return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
