import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { schoolLevels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTenantContext } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const body = await req.json();
    const { schoolLevelId, pin } = body;

    if (!schoolLevelId) {
      return NextResponse.json(
        { success: false, message: "Parameter schoolLevelId wajib disertakan." },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(schoolLevels)
      .where(and(eq(schoolLevels.id, Number(schoolLevelId)), eq(schoolLevels.tenantId, tenantId)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tingkatan sekolah tidak ditemukan atau tidak aktif." },
        { status: 404 }
      );
    }

    const targetLevel = rows[0];

    // Verifikasi PIN jika tingkatan ini diproteksi PIN
    if (targetLevel.pin && targetLevel.pin.trim() !== "") {
      if (!pin || String(pin).trim() !== targetLevel.pin.trim()) {
        return NextResponse.json(
          { success: false, message: "PIN otorisasi tingkatan sekolah tidak valid." },
          { status: 401 }
        );
      }
    }

    // Set cookie untuk menyimpan tingkatan aktif
    const cookieStore = await cookies();
    cookieStore.set("active_school_level_id", String(targetLevel.id), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      sameSite: "lax",
      httpOnly: false,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil beralih ke tingkatan ${targetLevel.name}`,
      activeLevel: {
        id: targetLevel.id,
        code: targetLevel.code,
        name: targetLevel.name,
        orderNumber: targetLevel.orderNumber,
        hasPin: Boolean(targetLevel.pin && targetLevel.pin.trim() !== ""),
      },
    });
  } catch (error) {
    console.error("Gagal beralih tingkatan sekolah:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat beralih tingkatan sekolah." },
      { status: 500 }
    );
  }
}
