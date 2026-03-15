import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull, asc, not } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function GET() {
  try {
    const authUser = await requireAuth();
    const [me] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, authUser.userId), isNull(users.deletedAt)))
      .limit(1);

    if (!me) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    
    return NextResponse.json({
      id: me.id,
      name: me.name,
      username: me.email,
      role: me.role
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Gagal memuat profil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await requireAuth();
    const [me] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, authUser.userId), isNull(users.deletedAt)))
      .limit(1);

    if (!me) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    const body = await req.json();
    const { name, username } = body;

    if (!name || !username) {
      return NextResponse.json({ error: "Nama dan username wajib diisi" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(
          and(
              eq(users.email, username.toLowerCase()),
              not(eq(users.id, me.id))
          )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Username (email) sudah digunakan" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ name, email: username.toLowerCase(), updatedAt: new Date() })
      .where(eq(users.id, me.id));

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
