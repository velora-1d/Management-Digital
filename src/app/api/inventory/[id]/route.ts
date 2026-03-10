import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/inventory/[id]
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory || inventory.deletedAt) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil detail inventaris" }, { status: 500 });
  }
}

// PUT /api/inventory/[id]
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const { name, category, quantity, condition, location, acquisitionCost } = body;

    const inventory = await prisma.inventory.update({
      where: { id },
      data: {
        name,
        category,
        quantity: Number(quantity),
        condition,
        location,
        acquisitionCost: Number(acquisitionCost) || 0,
      },
    });

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui", data: inventory });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui data inventaris" }, { status: 500 });
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    await prisma.inventory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data inventaris" }, { status: 500 });
  }
}
