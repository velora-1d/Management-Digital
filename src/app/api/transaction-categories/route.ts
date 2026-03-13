import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactionCategories } from "@/db/schema";
import { isNull, and, eq, or, ilike, asc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    const conditions = [isNull(transactionCategories.deletedAt)];
    if (type) conditions.push(eq(transactionCategories.type, type as any));
    if (q) {
      conditions.push(or(
        ilike(transactionCategories.name, `%${q}%`),
        ilike(transactionCategories.description, `%${q}%`)
      )!);
    }

    const whereClause = and(...conditions);

    const [categories, [{ total }]] = await Promise.all([
      db.select().from(transactionCategories).where(whereClause).orderBy(asc(transactionCategories.name)).limit(limit).offset(skip),
      db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(transactionCategories).where(whereClause),
    ]);

    return NextResponse.json(
      { 
        success: true, 
        data: categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, message: "Nama dan Tipe wajib diisi" }, { status: 400 });
    }

    const [category] = await db.insert(transactionCategories).values({
      name,
      type: type as any,
      description,
    }).returning();

    return NextResponse.json({ success: true, message: "Kategori berhasil ditambahkan", data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID kategori diperlukan" }, { status: 400 });

    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, message: "Nama dan Tipe wajib diisi" }, { status: 400 });
    }

    const [category] = await db.update(transactionCategories)
      .set({ name, type: type as any, description, updatedAt: new Date() })
      .where(eq(transactionCategories.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, message: "Kategori berhasil diubah", data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID kategori diperlukan" }, { status: 400 });

    const [category] = await db.update(transactionCategories)
      .set({ deletedAt: new Date() })
      .where(eq(transactionCategories.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus", data: category });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
