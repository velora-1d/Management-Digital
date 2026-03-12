import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (q) {
      where.OR = [
        { year: { contains: q, mode: "insensitive" } },
      ];
    }

    const [list, total] = await Promise.all([
      prisma.academicYear.findMany({
        where,
        orderBy: { year: "desc" },
        skip,
        take: limit,
      }),
      prisma.academicYear.count({ where }),
    ]);

    return NextResponse.json(
      { 
        success: true, 
        data: list,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
