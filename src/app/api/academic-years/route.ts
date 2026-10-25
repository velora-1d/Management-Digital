import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears } from "@/db/schema";
import { and, ilike, isNull, desc, sql, eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    const headerTenantId = req.headers.get("x-tenant-id");
    const tenantId = authUser?.tenantId || (headerTenantId ? parseInt(headerTenantId, 10) : 1);

    const { searchParams } = new URL(req.url);
    const optionsOnly = searchParams.get("options") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const conditions = [
      isNull(academicYears.deletedAt),
      eq(academicYears.tenantId, tenantId),
    ];
    if (q) {
      conditions.push(ilike(academicYears.year, `%${q}%`));
    }
    const whereClause = and(...conditions);

    if (optionsOnly) {
      const list = await db.select({
        id: academicYears.id,
        year: academicYears.year,
        isActive: academicYears.isActive,
      })
        .from(academicYears)
        .where(whereClause)
        .orderBy(desc(academicYears.year));

      return NextResponse.json(
        { success: true, data: list },
        { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } }
      );
    }

    const [list, totalRes] = await Promise.all([
      db.select()
        .from(academicYears)
        .where(whereClause)
        .orderBy(desc(academicYears.year))
        .limit(limit)
        .offset(skip),
      db.select({ count: sql`count(*)`.mapWith(Number) })
        .from(academicYears)
        .where(whereClause),
    ]);

    const total = totalRes[0].count;

    return NextResponse.json(
      { 
        success: true, 
        data: list,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    console.error("GET Academic Years error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data tahun ajaran" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    const headerTenantId = req.headers.get("x-tenant-id");
    const tenantId = authUser?.tenantId || (headerTenantId ? parseInt(headerTenantId, 10) : 1);

    const body = await req.json();

    if (!body.year) {
      return NextResponse.json({ success: false, message: "Tahun ajaran wajib diisi" }, { status: 400 });
    }

    // Pengecekan data duplikat per-tenant (termasuk yang di-soft-delete)
    const [existingWithDeleted] = await db
      .select()
      .from(academicYears)
      .where(and(
        eq(academicYears.tenantId, tenantId),
        eq(academicYears.year, body.year)
      ));

    if (existingWithDeleted) {
      if (existingWithDeleted.deletedAt) {
        // Jika ada tapi terhapus, aktifkan kembali (Restore)
        const [restored] = await db.update(academicYears)
          .set({ 
            deletedAt: null, 
            isActive: body.isActive || false,
            updatedAt: new Date() 
          })
          .where(and(eq(academicYears.id, existingWithDeleted.id), eq(academicYears.tenantId, tenantId)))
          .returning();
        
        return NextResponse.json({ success: true, message: "Tahun ajaran lama ditemukan di arsip dan telah diaktifkan kembali", data: restored });
      } else {
        // Jika ada dan aktif, berikan error
        return NextResponse.json({ success: false, message: "Tahun ajaran tersebut sudah ada dan masih aktif" }, { status: 400 });
      }
    }

    // Jika isActive true, nonaktifkan tahun ajaran lain hanya pada tenant ini
    if (body.isActive) {
      await db.update(academicYears)
        .set({ isActive: false })
        .where(eq(academicYears.tenantId, tenantId));
    }

    const [newYear] = await db.insert(academicYears).values({
      tenantId,
      year: body.year,
      isActive: body.isActive || false,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    }).returning();

    return NextResponse.json({ success: true, message: "Tahun ajaran berhasil ditambahkan", data: newYear });
  } catch (error: unknown) {
    console.error("POST Academic Year error:", error);
    return NextResponse.json({ success: false, message: "Gagal menambah tahun ajaran" }, { status: 500 });
  }
}
