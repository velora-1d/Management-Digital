import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventories } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/inventory/[id]
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const [inventory] = await db.select().from(inventories).where(eq(inventories.id, id)).limit(1);

    if (!inventory || inventory.deletedAt) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: inventory });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil detail inventaris" }, { status: 500 });
  }
}

// PATCH /api/inventory/[id]
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const { name, category, quantity, condition, location, acquisitionCost } = body;

    const [inventory] = await db.update(inventories)
      .set({
        name,
        category,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        condition,
        location,
        acquisitionCost: acquisitionCost !== undefined ? Number(acquisitionCost) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(inventories.id, id))
      .returning();

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui", data: inventory });
  } catch (error) {
    console.error("Inventory PATCH error:", error);
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

    await db.update(inventories)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(inventories.id, id));

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus data inventaris" }, { status: 500 });
  }
}
