import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id, deletedAt: null },
    });

    if (!subject) {
      return NextResponse.json({ success: false, error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { name, code, type, tingkatKelas, status } = body;

    const existingSubject = await prisma.subject.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingSubject) {
      return NextResponse.json({ success: false, error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (type !== undefined) updateData.type = type;
    if (tingkatKelas !== undefined) updateData.tingkatKelas = tingkatKelas;
    if (status !== undefined) updateData.status = status;

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedSubject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    // Soft delete
    await prisma.subject.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'dihapus'
      },
    });

    return NextResponse.json({ success: true, message: "Mata pelajaran berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
