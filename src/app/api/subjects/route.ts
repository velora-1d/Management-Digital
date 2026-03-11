import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const unitId = searchParams.get('unitId');

    const filter: any = {
      deletedAt: null,
    };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (unitId) filter.unitId = unitId;

    const subjects = await prisma.subject.findMany({
      where: filter,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: subjects });
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
