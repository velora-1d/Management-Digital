import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const curriculumId = searchParams.get("curriculumId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (curriculumId) where.curriculumId = Number(curriculumId);

    const [components, total] = await Promise.all([
      prisma.gradeComponent.findMany({
        where,
        orderBy: {
          urutan: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.gradeComponent.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: components,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching grade components:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { curriculumId, name, code, type, formatNilai, bobot, urutan, isWajib } = body;

    if (!curriculumId || !name || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const component = await prisma.gradeComponent.create({
      data: {
        curriculumId,
        name,
        code,
        type: type || "pengetahuan",
        formatNilai: formatNilai || "angka",
        bobot: bobot || 0,
        urutan: urutan || 1,
        isWajib: isWajib ?? true,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    console.error("Error creating grade component:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
