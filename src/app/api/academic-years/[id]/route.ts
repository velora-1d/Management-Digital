import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { academicYears } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const [item] = await db.select().from(academicYears).where(eq(academicYears.id, id)).limit(1);

    if (!item || item.deletedAt) {
      return NextResponse.json({ success: false, message: "Tahun ajaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    console.error("GET Academic Year ID Error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data tahun ajaran" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    // Jika isActive true, nonaktifkan tahun ajaran lain
    if (body.isActive) {
      await db.update(academicYears).set({ isActive: false });
    }

    // Pengecekan duplikasi jika year diubah
    if (body.year) {
      const [duplicate] = await db
        .select()
        .from(academicYears)
        .where(
          and(
            eq(academicYears.year, body.year),
            ne(academicYears.id, id)
          )
        );
      
      if (duplicate) {
        return NextResponse.json({ 
          success: false, 
          message: duplicate.deletedAt 
            ? "Tahun ajaran tersebut sudah ada di arsip. Silakan hapus data lama atau aktifkan kembali via menu tambah."
            : "Tahun ajaran tersebut sudah digunakan oleh data lain" 
        }, { status: 400 });
      }
    }

    const updateData: Partial<typeof academicYears.$inferInsert> = { updatedAt: new Date() };
    if (body.year !== undefined) updateData.year = body.year;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;

    const [updated] = await db.update(academicYears)
      .set(updateData)
      .where(eq(academicYears.id, id))
      .returning();

    return NextResponse.json({ success: true, message: "Tahun ajaran berhasil diperbarui", data: updated });
  } catch (error: unknown) {
    console.error("PUT Academic Year ID Error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data tahun ajaran" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    await db.update(academicYears)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(academicYears.id, id));

    return NextResponse.json({ success: true, message: "Tahun ajaran berhasil dihapus" });
  } catch (error: unknown) {
    console.error("DELETE Academic Year ID Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus data tahun ajaran" }, { status: 500 });
  }
}
