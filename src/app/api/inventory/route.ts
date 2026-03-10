import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inventory
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";
  const conditionFilter = searchParams.get("condition") || "";

  try {
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }
    if (conditionFilter) {
      where.condition = conditionFilter;
    }

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: inventories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data inventaris" },
      { status: 500 }
    );
  }
}

// POST /api/inventory
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, quantity, condition, location, acquisitionCost } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama aset wajib diisi" },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.create({
      data: {
        name,
        category: category || "",
        location: location || "",
        quantity: Number(quantity) || 1,
        condition: condition || "Baik",
        acquisitionCost: Number(acquisitionCost) || 0,
      },
    });

    return NextResponse.json({ success: true, data: inventory }, { status: 201 });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat data inventaris" },
      { status: 500 }
    );
  }
}
