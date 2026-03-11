import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";

  try {
    const where: any = { type: "guru", deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nip: { contains: search } },
      ];
    }

    const [teachers, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        select: {
          id: true,
          name: true,
          nip: true,
          type: true,
          position: true,
          status: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: teachers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, message: "Nama guru wajib diisi" }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        nip: body.nip || "",
        type: "guru",
        position: body.position || "",
        status: body.status || "aktif",
        phone: body.phone || "",
        address: body.address || "",
        joinDate: body.joinDate || "",
        baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
      },
    });

    return NextResponse.json({ success: true, message: "Data guru berhasil ditambahkan", data: employee });
  } catch (error) {
    console.error("Teacher POST error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data guru" }, { status: 500 });
  }
}
