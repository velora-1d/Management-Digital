import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const { status } = body;

    if (!["pending", "confirmed", "not_registered"].includes(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updated = await prisma.reRegistration.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui status daftar ulang" },
      { status: 500 }
    );
  }
}
