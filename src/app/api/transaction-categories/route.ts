import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type"); // New filter
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (type) where.type = type;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.transactionCategory.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.transactionCategory.count({ where }),
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

    const category = await prisma.transactionCategory.create({
      data: {
        name,
        type,
        description,
      },
    });

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

    const category = await prisma.transactionCategory.update({
      where: { id: Number(id) },
      data: {
        name,
        type,
        description,
      },
    });

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

    const category = await prisma.transactionCategory.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus", data: category });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
