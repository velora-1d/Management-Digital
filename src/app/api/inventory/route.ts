import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventories } from "@/db/schema";
import { isNull, or, ilike, eq, and, desc, sql } from "drizzle-orm";

// GET /api/inventory
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";
  const conditionFilter = searchParams.get("condition") || "";

  try {
    const conditions = [isNull(inventories.deletedAt)];

    if (search) {
      conditions.push(or(
        ilike(inventories.name, `%${search}%`),
        ilike(inventories.category, `%${search}%`),
        ilike(inventories.location, `%${search}%`)
      )!);
    }
    if (conditionFilter) {
      conditions.push(eq(inventories.condition, conditionFilter));
    }

    const whereClause = and(...conditions);

    const [data, [{ total }]] = await Promise.all([
      db.select({
        id: inventories.id,
        name: inventories.name,
        code: inventories.code,
        category: inventories.category,
        location: inventories.location,
        quantity: inventories.quantity,
        condition: inventories.condition,
        acquisitionDate: inventories.acquisitionDate,
        acquisitionCost: inventories.acquisitionCost,
        notes: inventories.notes,
      })
      .from(inventories)
      .where(whereClause)
      .orderBy(desc(inventories.id))
      .limit(limit)
      .offset((page - 1) * limit),

      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(inventories)
      .where(whereClause)
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data inventaris" },
      { status: 500 }
    );
  }
}

// POST /api/inventory
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, quantity, condition, location, acquisitionCost } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama aset wajib diisi" },
        { status: 400 }
      );
    }

    const [inventory] = await db.insert(inventories).values({
      name,
      category: category || "",
      location: location || "",
      quantity: Number(quantity) || 1,
      condition: condition || "Baik",
      acquisitionCost: Number(acquisitionCost) || 0,
    }).returning();

    return NextResponse.json({ success: true, data: inventory }, { status: 201 });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat data inventaris" },
      { status: 500 }
    );
  }
}
