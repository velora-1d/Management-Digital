import { NextResponse } from "next/server";
import { db } from "@/db";
import { extracurriculars } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/extracurricular/[id]
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    const body = await req.json();
    const { name, employeeId, schedule, status } = body;

    const [data] = await db
      .update(extracurriculars)
      .set({
        ...(name !== undefined && { name }),
        ...(employeeId !== undefined && { employeeId: employeeId ? parseInt(employeeId) : null }),
        ...(schedule !== undefined && { schedule }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      })
      .where(eq(extracurriculars.id, parseInt(id)))
      .returning();

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal mengupdate ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/extracurricular/[id]
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    await db
      .update(extracurriculars)
      .set({ deletedAt: new Date() })
      .where(eq(extracurriculars.id, parseInt(id)));

    return NextResponse.json({ message: "Ekskul berhasil dihapus" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
