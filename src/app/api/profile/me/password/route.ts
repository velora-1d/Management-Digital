import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, isNull, asc } from "drizzle-orm";
import bcrypt from "bcrypt";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const [me] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (!me || me.deletedAt) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

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
    
    await db
      .update(users)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(users.id, me.id));

    return NextResponse.json({ success: true, message: "Password berhasil diubah" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Profile password POST error:", error);
    return NextResponse.json({ error: "Gagal mengubah password" }, { status: 500 });
  }
}
