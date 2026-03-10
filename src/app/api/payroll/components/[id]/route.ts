import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


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
    await prisma.salaryComponent.update({
      where: { id: componentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Komponen dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus komponen" },
      { status: 500 }
    );
  }
}
