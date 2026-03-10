import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


async function getMe() {
  return await prisma.user.findFirst({
    where: { deletedAt: null },
    orderBy: { id: "asc" }
  });
}

export async function POST(req: Request) {
  try {
    const me = await getMe();
    if (!me) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    const body = await req.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json({ error: "Data password tidak lengkap" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(current_password, me.password);
    if (!isValid) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    
    await prisma.user.update({
      where: { id: me.id },
      data: { password: hashed }
    });

    return NextResponse.json({ success: true, message: "Password berhasil diubah" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengubah password" }, { status: 500 });
  }
}
