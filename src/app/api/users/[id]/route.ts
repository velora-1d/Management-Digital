import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const { name, username, password, role, status } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { email: username.toLowerCase(), id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ error: "Username (email) sudah digunakan oleh pengguna lain" }, { status: 400 });
      }
      updateData.email = username.toLowerCase();
    }
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: "Pengguna diperbarui" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui pengguna" },
      { status: 500 }
    );
  }
}
