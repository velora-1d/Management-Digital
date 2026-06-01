import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
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
  } catch {
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

    const email = username.toLowerCase();

    // 1. Cek User Existing (Aktif atau Terhapus)
    const [existingUser] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      // Jika user masih aktif, return error
      if (!existingUser.deletedAt) {
        return NextResponse.json({ error: "Username (email) sudah digunakan dan masih aktif" }, { status: 400 });
      }

      // 2. Restore Logic: Jika user terhapus, aktifkan kembali
      const hashedPassword = bcrypt.hashSync(password, 10);
      const [restoredUser] = await db.update(users).set({
        name,
        role,
        password: hashedPassword,
        status: "aktif",
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();

      return NextResponse.json({ 
        success: true, 
        message: "Akun pengguna berhasil dipulihkan",
        user: { id: restoredUser.id, name: restoredUser.name },
        isRestored: true 
      });
    }

    // 3. Create New User
    const hashedPassword = bcrypt.hashSync(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email: email,
      password: hashedPassword,
      role,
      status: "aktif",
    }).returning();

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name } }, { status: 201 });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
