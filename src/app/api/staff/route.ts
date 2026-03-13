import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, ilike, or, desc, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";

  try {
    let whereClause = and(eq(employees.type, "staf"), isNull(employees.deletedAt));
    
    if (search) {
      whereClause = and(
        whereClause,
        or(
          ilike(employees.name, `%${search}%`),
          ilike(employees.nip, `%${search}%`)
        )
      );
    }

    const [staff, [{ total }]] = await Promise.all([
      db
        .select()
        .from(employees)
        .where(whereClause)
        .orderBy(desc(employees.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(employees)
        .where(whereClause)
    ]);

    return NextResponse.json({
      success: true,
      data: staff,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, message: "Nama staf wajib diisi" }, { status: 400 });
    }

    const [employee] = await db
      .insert(employees)
      .values({
        name: body.name,
        nip: body.nip || "",
        type: "staf",
        position: body.position || "",
        status: (body.status || "aktif") as any,
        phone: body.phone || "",
        address: body.address || "",
        joinDate: body.joinDate || "",
        baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
      })
      .returning();

    return NextResponse.json({ success: true, message: "Data staf berhasil ditambahkan", data: employee });
  } catch (error) {
    console.error("Staff POST error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data staf" }, { status: 500 });
  }
}
