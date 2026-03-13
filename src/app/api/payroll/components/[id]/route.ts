import { NextResponse } from "next/server";
import { db } from "@/db";
import { salaryComponents } from "@/db/schema";
import { eq } from "drizzle-orm";


// DELETE /api/payroll/components/[id]
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const componentId = parseInt(params.id);

    if (isNaN(componentId)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Soft delete
    await db
      .update(salaryComponents)
      .set({ deletedAt: new Date() })
      .where(eq(salaryComponents.id, componentId));

    return NextResponse.json({ success: true, message: "Komponen dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus komponen" },
      { status: 500 }
    );
  }
}
