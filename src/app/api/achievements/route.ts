import { NextResponse } from "next/server";
import { db } from "@/db";
import { webAchievements } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/achievements — Ambil daftar Prestasi Siswa
 */
export async function GET() {
  try {
    await requireAuth();

    const data = await db
      .select()
      .from(webAchievements)
      .orderBy(desc(webAchievements.year), desc(webAchievements.createdAt));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch achievements error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data prestasi" }, { status: 500 });
  }
}
