import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { isNull, eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.id));

    const formatted = userList.map(u => ({ ...u, username: u.email }));
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, password, role } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const [existingUser] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, username.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json({ error: "Username (email) sudah digunakan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email: username.toLowerCase(),
      password: hashedPassword,
      role: role as any,
      status: "aktif" as any,
    }).returning();

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
