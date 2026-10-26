import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { schoolLevels } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getTenantContext } from "@/lib/tenant";

export async function GET() {
  try {
    const { tenantId } = await getTenantContext();
    const cookieStore = await cookies();
    const savedActiveId = cookieStore.get("active_school_level_id")?.value;

    const levels = await db
      .select()
      .from(schoolLevels)
      .where(and(eq(schoolLevels.tenantId, tenantId), eq(schoolLevels.isActive, true)))
      .orderBy(asc(schoolLevels.orderNumber), asc(schoolLevels.id));

    // Fallback seed jika tenant belum memiliki data jenjang di DB
    let effectiveLevels = levels;
    if (effectiveLevels.length === 0) {
      const defaultSeeds = [
        { tenantId, code: "MTS", name: "Madrasah Tsanawiyah (MTs)", orderNumber: 1, isActive: true },
        { tenantId, code: "MA", name: "Madrasah Aliyah (MA)", orderNumber: 2, isActive: true },
        { tenantId, code: "PONDOK", name: "Pondok Pesantren", orderNumber: 3, isActive: true },
      ];
      effectiveLevels = await db.insert(schoolLevels).values(defaultSeeds).returning();
    }

    const activeLevel =
      (savedActiveId && effectiveLevels.find((l) => String(l.id) === savedActiveId)) ||
      effectiveLevels[0] ||
      null;

    return NextResponse.json({
      success: true,
      levels: effectiveLevels.map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        orderNumber: l.orderNumber,
        hasPin: Boolean(l.pin && l.pin.trim() !== ""),
      })),
      activeLevelId: activeLevel?.id ?? null,
      activeLevel: activeLevel
        ? {
            id: activeLevel.id,
            code: activeLevel.code,
            name: activeLevel.name,
            orderNumber: activeLevel.orderNumber,
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
