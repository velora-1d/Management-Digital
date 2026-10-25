import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isNull, asc, sql } from "drizzle-orm";

// GET /api/coop/products
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [data, [{ total }]] = await Promise.all([
      db.select()
        .from(products)
        .where(isNull(products.deletedAt))
        .orderBy(asc(products.name))
        .limit(limit)
        .offset(skip),
        
      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(products)
        .where(isNull(products.deletedAt))
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat produk";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/coop/products
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, hargaJual, hargaBeli, stok, minStok } = body;

    if (!name) return NextResponse.json({ error: "Nama produk wajib" }, { status: 400 });

    const [data] = await db.insert(products).values({
      name,
      category: category || "",
      hargaJual: parseFloat(hargaJual) || 0,
      hargaBeli: parseFloat(hargaBeli) || 0,
      stok: parseInt(stok) || 0,
      minStok: parseInt(minStok) || 0,
    }).returning();
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah produk";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
