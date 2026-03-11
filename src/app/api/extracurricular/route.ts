import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/extracurricular
export async function GET() {
  try {
    const data = await prisma.extracurricular.findMany({
      where: { deletedAt: null },
      include: {
        employee: { select: { id: true, name: true } },
        members: {
          include: { student: { select: { id: true, name: true, nisn: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat data ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/extracurricular
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, employeeId, schedule, status } = body;
    if (!name) return NextResponse.json({ error: "Nama ekskul wajib diisi" }, { status: 400 });

    const data = await prisma.extracurricular.create({
      data: {
        name,
        employeeId: employeeId ? parseInt(employeeId) : null,
        schedule: schedule || "",
        status: status || "aktif",
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menambah ekskul";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
