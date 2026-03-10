import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const employee = await prisma.employee.findFirst({
      where: { id: parseInt(params.id), deletedAt: null },
    });
    if (!employee) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const employee = await prisma.employee.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        nip: body.nip || "",
        type: body.type || "guru",
        position: body.position || "",
        status: body.status || "aktif",
        phone: body.phone || "",
        address: body.address || "",
        joinDate: body.joinDate || "",
        baseSalary: body.baseSalary ? Number(body.baseSalary) : 0,
      },
    });
    return NextResponse.json({ success: true, message: "Data berhasil diperbarui", data: employee });
  } catch (error) {
    console.error("Employee PUT error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await prisma.employee.update({
      where: { id: parseInt(params.id) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
