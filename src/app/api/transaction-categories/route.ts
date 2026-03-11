import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.transactionCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      { success: true, data: categories },
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
