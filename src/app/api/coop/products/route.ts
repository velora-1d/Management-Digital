import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coop/products
export async function GET() {
  try {
    const data = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(data);
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

    const data = await prisma.product.create({
      data: {
        name,
        category: category || "",
        hargaJual: parseFloat(hargaJual) || 0,
        hargaBeli: parseFloat(hargaBeli) || 0,
        stok: parseInt(stok) || 0,
        minStok: parseInt(minStok) || 0,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah produk";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
