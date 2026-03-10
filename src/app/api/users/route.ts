import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";


export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Fetching users from DB...");
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { id: "desc" },
    });

    const formatted = users.map(u => ({
      ...u,
      username: u.email // Map email to username for frontend compatibility
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, password, role } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: username.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username (email) sudah digunakan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: username.toLowerCase(),
        password: hashedPassword,
        role,
        status: "aktif"
      }
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal membuat pengguna" },
      { status: 500 }
    );
  }
}
