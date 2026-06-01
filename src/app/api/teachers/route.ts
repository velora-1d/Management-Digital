import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, ilike, or, desc, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";

  try {
    let whereClause = and(eq(employees.type, "guru"), isNull(employees.deletedAt));
    
    if (search) {
      whereClause = and(
        whereClause,
        or(
          ilike(employees.name, `%${search}%`),
          ilike(employees.nip, `%${search}%`)
        )
      );
    }
    if (status) {
      whereClause = and(whereClause, eq(employees.status, status as "aktif" | "nonaktif"));
    }

    const [teachers, [{ total }]] = await Promise.all([
      db
        .select({
          id: employees.id,
          name: employees.name,
          nip: employees.nip,
          type: employees.type,
          position: employees.position,
          status: employees.status,
          phone: employees.phone,
          createdAt: employees.createdAt,
        })
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
      data: teachers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    console.error("Teachers GET error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nip, position, status, phone, address, joinDate, baseSalary } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "Nama guru wajib diisi" }, { status: 400 });
    }

    // 1. Cek duplikasi (termasuk yang di-soft delete)
    // Kita cek berdasarkan Nama (case-insensitive) dan NIP (jika ada)
    const existing = await db.select()
      .from(employees)
      .where(
        and(
          eq(employees.type, "guru"),
          or(
            ilike(employees.name, name.trim()),
            nip ? eq(employees.nip, nip.trim()) : undefined
          )
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];

      // Jika masih aktif
      if (!record.deletedAt) {
        const field = record.name.toLowerCase() === name.trim().toLowerCase() ? "Nama" : "NIP";
        return NextResponse.json({ 
          success: false, 
          message: `${field} guru "${field === 'Nama' ? name : nip}" sudah terdaftar dan masih aktif.` 
        }, { status: 400 });
      }

      // Jika terhapus, lakukan Restore
      const [restored] = await db.update(employees)
        .set({
          name: name.trim(),
          nip: nip?.trim() || record.nip,
          position: position || record.position,
          status: status || "aktif",
          phone: phone || record.phone,
          address: address || record.address,
          joinDate: joinDate || record.joinDate,
          baseSalary: baseSalary ? Number(baseSalary) : record.baseSalary,
          deletedAt: null,
          updatedAt: new Date()
        })
        .where(eq(employees.id, record.id))
        .returning();

      return NextResponse.json({ 
        success: true, 
        message: "Data guru yang sebelumnya terhapus telah diaktifkan kembali.", 
        data: restored,
        isRestored: true 
      });
    }

    // 2. Insert baru
    const [newTeacher] = await db
      .insert(employees)
      .values({
        name: name.trim(),
        nip: nip?.trim() || "",
        type: "guru",
        position: position || "",
        status: status || "aktif",
        phone: phone || "",
        address: address || "",
        joinDate: joinDate || "",
        baseSalary: baseSalary ? Number(baseSalary) : 0,
      })
      .returning();

    return NextResponse.json({ success: true, message: "Data guru berhasil ditambahkan", data: newTeacher });
  } catch (error: unknown) {
    console.error("Teacher POST error:", error);
    const msg = error instanceof Error ? error.message : "Gagal menyimpan data guru";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
