import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

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

    const [item] = await db.select().from(employees).where(and(eq(employees.id, id), isNull(employees.deletedAt))).limit(1);

    if (!item) {
      return NextResponse.json({ success: false, message: "Pegawai tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
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

    const [updated] = await db.update(employees)
      .set({
        name: body.name,
        nip: body.nip,
        type: body.type,
        position: body.position,
        status: body.status,
        phone: body.phone,
        address: body.address,
        joinDate: body.joinDate,
        baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id))
      .returning();

    return NextResponse.json({ success: true, message: "Data pegawai berhasil diperbarui", data: updated });
  } catch (error) {
    console.error("PUT Employee error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
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

    await db.update(employees)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(employees.id, id));

    return NextResponse.json({ success: true, message: "Data pegawai berhasil dihapus" });
  } catch {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
