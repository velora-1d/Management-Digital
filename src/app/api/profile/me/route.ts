import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// Fungsi helper simulasi untuk mendapatkan user yang sedang login (mengambil admin pertama)
async function getMe() {
  return await prisma.user.findFirst({
    where: { deletedAt: null },
    orderBy: { id: "asc" }
  });
}

export async function GET() {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    
    return NextResponse.json({
      id: me.id,
      name: me.name,
      username: me.email,
      role: me.role
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat profil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    const body = await req.json();
    const { name, username } = body;

    if (!name || !username) {
      return NextResponse.json({ error: "Nama dan username wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: username.toLowerCase(), id: { not: me.id } }
    });

    if (existing) {
      return NextResponse.json({ error: "Username (email) sudah digunakan" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: me.id },
      data: { name, email: username.toLowerCase() }
    });

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
