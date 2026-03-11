import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const headersList = await headers();

    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");
    const semester = searchParams.get("semester");

    const where: any = {};
    if (academicYearId) where.academicYearId = Number(academicYearId);
    if (semester) where.semester = semester;

    const curriculums = await prisma.curriculum.findMany({
      where,
      include: {
        academicYear: true,
        gradeComponents: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(curriculums);
  } catch (error) {
    console.error("Error fetching curriculums:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();

    const body = await req.json();
    const { type, academicYearId, semester, isLocked } = body;

    if (!type || !academicYearId || !semester) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Hindari duplikasi tipe kurikulum per tahun ajaran & semester
    const existing = await prisma.curriculum.findFirst({
      where: {
        type,
        academicYearId,
        semester,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Curriculum configuration already exists for this period" },
        { status: 400 }
      );
    }

    const curriculum = await prisma.curriculum.create({
      data: {
        type,
        academicYearId,
        semester,
        isLocked: isLocked || false,
      },
    });

    return NextResponse.json(curriculum, { status: 201 });
  } catch (error) {
    console.error("Error creating curriculum:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
