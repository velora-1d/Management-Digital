import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: { deletedAt: null },
      include: {
        academicYear: { select: { id: true, year: true } },
        waliKelas: { select: { id: true, name: true } },
        _count: { select: { students: { where: { deletedAt: null } } } },
      },
      orderBy: [{ name: "asc" }],
    });

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
      { success: true, data: classroomsWithCount },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
