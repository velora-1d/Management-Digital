import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const unitId = searchParams.get('unitId');
    const q = searchParams.get('q') || "";
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const filter: any = {
      deletedAt: null,
    };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (unitId) filter.unitId = unitId;
    if (q) {
      filter.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where: filter,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.subject.count({ where: filter })
    ]);

    return NextResponse.json(
      { 
        success: true, 
        data: subjects,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, type, tingkatKelas, unitId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ success: false, error: "Nama mata pelajaran wajib diisi" }, { status: 400 });
    }

    const newSubject = await prisma.subject.create({
      data: {
        name,
        code: code || '',
        type: type || 'wajib',
        tingkatKelas: tingkatKelas || '',
        unitId: unitId || '',
        status: 'aktif',
      }
    });

    return NextResponse.json({ success: true, data: newSubject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
