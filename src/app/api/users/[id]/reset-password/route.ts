import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newPassword = "";
    for (let i = 0; i < 6; i++) newPassword += chars.charAt(Math.floor(Math.random() * chars.length));

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: "Password berhasil direset", new_password: newPassword });
  } catch {
    return NextResponse.json({ error: "Gagal me-reset password" }, { status: 500 });
  }
}
