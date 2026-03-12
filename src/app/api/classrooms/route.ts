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
        { name: { contains: q, mode: "insensitive" } },
      ];
    }

    const [classrooms, total] = await Promise.all([
      prisma.classroom.findMany({
        where,
        include: {
          academicYear: { select: { id: true, year: true } },
          waliKelas: { select: { id: true, name: true } },
          _count: { select: { students: { where: { deletedAt: null } } } },
        },
        orderBy: [{ name: "asc" }],
        skip,
        take: limit,
      }),
      prisma.classroom.count({ where }),
    ]);

    const classroomsWithCount = classrooms.map((cls) => ({
      id: cls.id,
      name: cls.name,
      academicYearId: cls.academicYearId,
      academicYear: cls.academicYear?.year || "-",
      waliKelasId: cls.waliKelasId,
      waliKelas: cls.waliKelas?.name || "-",
      infaqNominal: cls.infaqNominal || 0,
      student_count: cls._count.students,
    }));

    return NextResponse.json(
      { 
        success: true, 
        data: classroomsWithCount,
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
