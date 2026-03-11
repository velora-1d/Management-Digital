import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'guru' or 'staf'
  const search = searchParams.get("q") || "";

  try {
    const where: any = { deletedAt: null };
    if (type) {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nip: { contains: search } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Employees GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}
