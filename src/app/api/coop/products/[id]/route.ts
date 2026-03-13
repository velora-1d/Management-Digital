import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/coop/products/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.hargaJual !== undefined) updateData.hargaJual = parseFloat(body.hargaJual);
    if (body.hargaBeli !== undefined) updateData.hargaBeli = parseFloat(body.hargaBeli);
    if (body.stok !== undefined) updateData.stok = parseInt(body.stok);
    if (body.minStok !== undefined) updateData.minStok = parseInt(body.minStok);
    if (body.status !== undefined) updateData.status = body.status;
    
    updateData.updatedAt = new Date();

    const [data] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
      .returning();
      
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
    await db.update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, parseInt(id)));
      
    return NextResponse.json({ message: "Produk dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus produk";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
