import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const [subject] = await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)));

    if (!subject) {
      return NextResponse.json({ success: false, error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { name, code, type, tingkatKelas, status } = body;

    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)));

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    const updateData: Partial<typeof subjects.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (type !== undefined) updateData.type = type;
    if (tingkatKelas !== undefined) updateData.tingkatKelas = tingkatKelas;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db.update(subjects).set(updateData).where(eq(subjects.id, id)).returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    // Soft delete
    await db
      .update(subjects)
      .set({ deletedAt: new Date(), status: "dihapus", updatedAt: new Date() })
      .where(eq(subjects.id, id));

    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
