import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { and, eq, isNull, ne, ilike } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const [subject] = await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)));

    if (!subject) {
      return NextResponse.json({ success: false, message: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { name, code, type, tingkatKelas, status } = body;

    const existing = await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    // Pengecekan Duplikasi Nama (jika nama diubah)
    if (name && name !== existing[0].name) {
      const [duplicate] = await db.select()
        .from(subjects)
        .where(
          and(
            ilike(subjects.name, name),
            ne(subjects.id, id),
            isNull(subjects.deletedAt)
          )
        )
        .limit(1);

      if (duplicate) {
        return NextResponse.json({ 
          success: false, 
          message: `Mata pelajaran "${name}" sudah ada di data aktif.` 
        }, { status: 400 });
      }
    }

    const updateData: Partial<typeof subjects.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (type !== undefined) updateData.type = type;
    if (tingkatKelas !== undefined) updateData.tingkatKelas = tingkatKelas;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db.update(subjects).set(updateData).where(eq(subjects.id, id)).returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    // Soft delete
    await db
      .update(subjects)
      .set({ deletedAt: new Date(), status: "dihapus", updatedAt: new Date() })
      .where(eq(subjects.id, id));

    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export const PATCH = PUT;
