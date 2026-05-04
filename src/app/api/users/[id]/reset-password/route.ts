import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, AuthError } from "@/lib/rbac";
import { randomInt } from "node:crypto";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const currentUser = await requireAuth();
    requireRole(currentUser, ["superadmin", "admin"]);

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newPassword = "";
    for (let i = 0; i < 6; i++) {
      newPassword += chars.charAt(randomInt(0, chars.length));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: "Password berhasil direset", new_password: newPassword });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Gagal me-reset password" }, { status: 500 });
  }
}
