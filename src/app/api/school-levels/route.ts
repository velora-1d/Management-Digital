import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { schoolLevels } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { getTenantContext } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";
    const cookieStore = await cookies();
    const savedActiveId = cookieStore.get("active_school_level_id")?.value;

    const conditions = [eq(schoolLevels.tenantId, tenantId)];
    if (!includeAll) {
      conditions.push(eq(schoolLevels.isActive, true));
    }

    const levels = await db
      .select({
        id: schoolLevels.id,
        tenantId: schoolLevels.tenantId,
        code: schoolLevels.code,
        name: schoolLevels.name,
        orderNumber: schoolLevels.orderNumber,
        isActive: schoolLevels.isActive,
        pin: schoolLevels.pin,
        class_rooms_count: sql<number>`(
          SELECT count(*) FROM classrooms c 
          WHERE c.school_level_id = ${schoolLevels.id} AND c.deleted_at IS NULL
        )`.mapWith(Number),
        students_count: sql<number>`(
          SELECT count(*) FROM students s 
          WHERE s.school_level_id = ${schoolLevels.id} AND s.deleted_at IS NULL AND s.status = 'aktif'
        )`.mapWith(Number),
      })
      .from(schoolLevels)
      .where(and(...conditions))
      .orderBy(asc(schoolLevels.orderNumber), asc(schoolLevels.id));

    // Fallback seed jika tenant belum memiliki data jenjang di DB
    let effectiveLevels = levels;
    if (effectiveLevels.length === 0) {
      const defaultSeeds = [
        { tenantId, code: "MTS", name: "Madrasah Tsanawiyah (MTs)", orderNumber: 1, isActive: true },
        { tenantId, code: "MA", name: "Madrasah Aliyah (MA)", orderNumber: 2, isActive: true },
        { tenantId, code: "PONDOK", name: "Pondok Pesantren", orderNumber: 3, isActive: true },
      ];
      await db.insert(schoolLevels).values(defaultSeeds);
      effectiveLevels = await db
        .select({
          id: schoolLevels.id,
          tenantId: schoolLevels.tenantId,
          code: schoolLevels.code,
          name: schoolLevels.name,
          orderNumber: schoolLevels.orderNumber,
          isActive: schoolLevels.isActive,
          pin: schoolLevels.pin,
          class_rooms_count: sql<number>`0`.mapWith(Number),
          students_count: sql<number>`0`.mapWith(Number),
        })
        .from(schoolLevels)
        .where(and(...conditions))
        .orderBy(asc(schoolLevels.orderNumber), asc(schoolLevels.id));
    }

    const activeLevel =
      (savedActiveId && effectiveLevels.find((l) => String(l.id) === savedActiveId)) ||
      effectiveLevels.find((l) => l.isActive) ||
      effectiveLevels[0] ||
      null;

    return NextResponse.json({
      success: true,
      levels: effectiveLevels.map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        orderNumber: l.orderNumber,
        isActive: l.isActive,
        hasPin: Boolean(l.pin && l.pin.trim() !== ""),
        class_rooms_count: l.class_rooms_count || 0,
        students_count: l.students_count || 0,
      })),
      activeLevelId: activeLevel?.id ?? null,
      activeLevel: activeLevel
        ? {
            id: activeLevel.id,
            code: activeLevel.code,
            name: activeLevel.name,
            orderNumber: activeLevel.orderNumber,
            isActive: activeLevel.isActive,
            hasPin: Boolean(activeLevel.pin && activeLevel.pin.trim() !== ""),
          }
        : null,
    });
  } catch (error) {
    console.error("Gagal mengambil data school_levels:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil data jenjang sekolah." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const body = await req.json();
    const { code, name, orderNumber, pin } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, message: "Kode dan Nama Jenjang wajib diisi." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(schoolLevels)
      .values({
        tenantId,
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
        orderNumber: typeof orderNumber === "number" ? orderNumber : 1,
        pin: pin ? String(pin).trim() : null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Tingkatan sekolah berhasil ditambahkan.",
      level: created,
    });
  } catch (error) {
    console.error("Gagal menambahkan school_level:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan tingkatan sekolah." },
      { status: 500 }
    );
  }
}
