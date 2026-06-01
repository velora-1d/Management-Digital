import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull, ne, or, ilike } from "drizzle-orm";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, parseInt(params.id)), isNull(employees.deletedAt)))
      .limit(1);

    if (!employee) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: employee });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const id = parseInt(params.id);

    // 1. Ambil data lama
    const [existing] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), isNull(employees.deletedAt)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    // 2. Pengecekan Duplikasi (jika nama atau NIP dubah)
    const { name, nip } = body;
    if ((name && name !== existing.name) || (nip && nip !== existing.nip)) {
      const [duplicate] = await db.select()
        .from(employees)
        .where(
          and(
            eq(employees.type, "staf"),
            ne(employees.id, id),
            isNull(employees.deletedAt),
            or(
              name ? ilike(employees.name, name.trim()) : undefined,
              nip ? eq(employees.nip, nip.trim()) : undefined
            )
          )
        )
        .limit(1);

      if (duplicate) {
        const field = duplicate.name.toLowerCase() === name?.trim().toLowerCase() ? "Nama" : "NIP";
        return NextResponse.json({ 
          success: false, 
          message: `${field} staf "${field === 'Nama' ? name : nip}" sudah terdaftar di data aktif.` 
        }, { status: 400 });
      }
    }

    const updateData: Partial<typeof employees.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.nip !== undefined) updateData.nip = (body.nip || "").trim();
    if (body.type !== undefined) updateData.type = body.type || "staf";
    if (body.position !== undefined) updateData.position = body.position || "";
    if (body.status !== undefined) updateData.status = body.status || "aktif";
    if (body.phone !== undefined) updateData.phone = body.phone || "";
    if (body.address !== undefined) updateData.address = body.address || "";
    if (body.joinDate !== undefined) updateData.joinDate = body.joinDate || "";
    if (body.baseSalary !== undefined) updateData.baseSalary = body.baseSalary ? Number(body.baseSalary) : 0;

    const [employee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui", data: employee });
  } catch (error: unknown) {
    console.error("Staff PUT error:", error);
    const msg = error instanceof Error ? error.message : "Gagal memperbarui data staf";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db
      .update(employees)
      .set({ 
        deletedAt: new Date(),
        status: "dihapus",
        updatedAt: new Date()
      })
      .where(eq(employees.id, parseInt(params.id)));

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus data staf";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
