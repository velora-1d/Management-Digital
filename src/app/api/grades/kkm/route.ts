import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const headersList = await headers();

    const { searchParams } = new URL(req.url);
    const curriculumId = searchParams.get("curriculumId");
    const subjectId = searchParams.get("subjectId");

    const where: any = {};
    if (curriculumId) where.curriculumId = Number(curriculumId);
    if (subjectId) where.subjectId = Number(subjectId);

    const kkms = await prisma.kKM.findMany({
      where,
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(kkms);
  } catch (error) {
    console.error("Error fetching KKMs:", error);
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
    const { curriculumId, subjectId, nilaiKKM, deskripsiKKTP } = body;

    if (!curriculumId || !subjectId || nilaiKKM === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert KKM
    const kkm = await prisma.kKM.upsert({
      where: {
        unique_kkm: {
          curriculumId: Number(curriculumId),
          subjectId: Number(subjectId),
        },
      },
      update: {
        nilaiKKM: Number(nilaiKKM),
        deskripsiKKTP: deskripsiKKTP || "",
      },
      create: {
        curriculumId: Number(curriculumId),
        subjectId: Number(subjectId),
        nilaiKKM: Number(nilaiKKM),
        deskripsiKKTP: deskripsiKKTP || "",
      },
    });

    return NextResponse.json(kkm, { status: 201 });
  } catch (error) {
    console.error("Error upserting KKM:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
