import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/coop/products/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.hargaJual !== undefined && { hargaJual: parseFloat(body.hargaJual) }),
        ...(body.hargaBeli !== undefined && { hargaBeli: parseFloat(body.hargaBeli) }),
        ...(body.stok !== undefined && { stok: parseInt(body.stok) }),
        ...(body.minStok !== undefined && { minStok: parseInt(body.minStok) }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate produk";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/coop/products/[id] — soft delete
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ message: "Produk dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus produk";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
