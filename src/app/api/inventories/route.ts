import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventories } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/inventories — Ambil daftar Inventaris Barang
 */
export async function GET() {
  try {
    await requireAuth();

    const data = await db
      .select()
      .from(inventories)
      .where(isNull(inventories.deletedAt))
      .orderBy(asc(inventories.name));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch inventories error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data inventaris" }, { status: 500 });
  }
}
