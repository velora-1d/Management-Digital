import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

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
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const [employee] = await db
      .update(employees)
      .set({
        name: body.name,
        nip: body.nip || "",
        type: (body.type || "staf") as any,
        position: body.position || "",
        status: (body.status || "aktif") as any,
        phone: body.phone || "",
        address: body.address || "",
        joinDate: body.joinDate || "",
        baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, parseInt(params.id)))
      .returning();

    return NextResponse.json({ success: true, message: "Data berhasil diperbarui", data: employee });
  } catch (error) {
    console.error("Staff PUT error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await db
      .update(employees)
      .set({ deletedAt: new Date() })
      .where(eq(employees.id, parseInt(params.id)));

    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
