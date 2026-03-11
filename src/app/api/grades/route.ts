import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const headersList = await headers();

    const { searchParams } = new URL(req.url);
    const componentId = searchParams.get("componentId");
    const classroomId = searchParams.get("classroomId");
    const subjectId = searchParams.get("subjectId");

    const where: any = {};
    if (componentId) where.componentId = Number(componentId);
    if (classroomId) where.classroomId = Number(classroomId);
    if (subjectId) where.subjectId = Number(subjectId);

    const grades = await prisma.studentGrade.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: {
        student: { name: 'asc' },
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("Error fetching grades:", error);
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
    const { componentId, classroomId, subjectId, grades } = body;
    // grades = [{ studentId: 1, nilaiAngka: 80, predikat: "B" }, ...]

    if (!componentId || !classroomId || !subjectId || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: "Missing required fields or grades array" },
        { status: 400 }
      );
    }

    const results = [];

    // Lakukan upsert dalam transaksi sequential untuk setiap nilai
    // Karena SQLite/Neon kadang punya limit concurrency, kita await promise all
    const promises = grades.map((g) => {
      return prisma.studentGrade.upsert({
        where: {
          unique_grade: {
            componentId: Number(componentId),
            studentId: Number(g.studentId),
            subjectId: Number(subjectId),
          },
        },
        update: {
          classroomId: Number(classroomId),
          nilaiAngka: Number(g.nilaiAngka),
          predikat: g.predikat || "",
        },
        create: {
          componentId: Number(componentId),
          studentId: Number(g.studentId),
          subjectId: Number(subjectId),
          classroomId: Number(classroomId),
          nilaiAngka: Number(g.nilaiAngka),
          predikat: g.predikat || "",
        },
      });
    });

    const savedGrades = await Promise.all(promises);

    return NextResponse.json({ success: true, count: savedGrades.length }, { status: 201 });
  } catch (error) {
    console.error("Error upserting grades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
