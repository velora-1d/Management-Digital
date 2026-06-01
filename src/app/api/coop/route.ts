import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isNull, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

/**
 * GET /api/coop — Ambil daftar Produk Koperasi / Kantin
 */
export async function GET() {
  try {
    await requireAuth();

    // Fix: Menggunakan kolom category karena kolom type tidak ada di schema
    const data = await db
      .select()
      .from(products)
      .where(
        isNull(products.deletedAt)
      )
      .orderBy(asc(products.name));

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Fetch coop products error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat data koperasi" }, { status: 500 });
  }
}
