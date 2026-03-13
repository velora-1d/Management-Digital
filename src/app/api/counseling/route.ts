import { NextResponse } from "next/server";
import { db } from "@/db";
import { counselingRecords, students, employees, classrooms } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// GET /api/counseling?studentId=X&category=X&status=X
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const conditions = [];
    if (studentId) conditions.push(eq(counselingRecords.studentId, parseInt(studentId)));
    if (category) conditions.push(eq(counselingRecords.category, category as any));
    if (status) conditions.push(eq(counselingRecords.status, status as any));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rawData, [{ total }]] = await Promise.all([
      db.select({
        id: counselingRecords.id,
        studentId: counselingRecords.studentId,
        counselorId: counselingRecords.counselorId,
        date: counselingRecords.date,
        category: counselingRecords.category,
        description: counselingRecords.description,
        followUp: counselingRecords.followUp,
        status: counselingRecords.status,
        createdAt: counselingRecords.createdAt,
        updatedAt: counselingRecords.updatedAt,
        studentName: students.name,
        studentNisn: students.nisn,
        classroomName: classrooms.name,
        counselorName: employees.name,
        counselorId2: employees.id,
        studentId2: students.id,
      })
      .from(counselingRecords)
      .leftJoin(students, eq(counselingRecords.studentId, students.id))
      .leftJoin(classrooms, eq(students.classroomId, classrooms.id))
      .leftJoin(employees, eq(counselingRecords.counselorId, employees.id))
      .where(whereClause)
      .orderBy(desc(counselingRecords.createdAt))
      .limit(limit)
      .offset(skip),
      
      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(counselingRecords)
      .where(whereClause)
    ]);

    const data = rawData.map(r => ({
      id: r.id,
      studentId: r.studentId,
      counselorId: r.counselorId,
      date: r.date,
      category: r.category,
      description: r.description,
      followUp: r.followUp,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      student: { id: r.studentId2, name: r.studentName, nisn: r.studentNisn, classroom: { name: r.classroomName } },
      counselor: { id: r.counselorId2, name: r.counselorName },
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat data BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/counseling
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, counselorId, date, category, description, followUp, status } = body;

    if (!studentId || !category) {
      return NextResponse.json({ error: "Siswa dan kategori wajib diisi" }, { status: 400 });
    }

    const [data] = await db.insert(counselingRecords).values({
      studentId: parseInt(studentId),
      counselorId: counselorId ? parseInt(counselorId) : null,
      date: date || new Date().toISOString().split("T")[0],
      category: category as any,
      description: description || "",
      followUp: followUp || "",
      status: (status as any) || "aktif",
    }).returning();
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah catatan BK";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
