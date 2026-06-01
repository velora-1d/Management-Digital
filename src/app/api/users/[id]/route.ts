import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq, and, ne, isNull } from "drizzle-orm";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ id: user.id, name: user.name, username: user.email, role: user.role, status: user.status });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const body = await request.json();
    const { name, username, password, role, status } = body;

    const updateData: Partial<typeof users.$inferInsert> = {};
    if (name) updateData.name = name;
    if (username) {
      const email = username.toLowerCase();
      const [existing] = await db.select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.email, email), 
            ne(users.id, id),
            isNull(users.deletedAt) // Hanya cek duplikasi dengan user aktif
          )
        )
        .limit(1);
      if (existing) return NextResponse.json({ error: "Username (email) sudah digunakan oleh pengguna lain" }, { status: 400 });
      updateData.email = email;
    }
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password && password.trim() !== "") {
      updateData.password = bcrypt.hashSync(password, 10);
    }
    updateData.updatedAt = new Date();

    await db.update(users).set(updateData).where(eq(users.id, id));
    return NextResponse.json({ success: true, message: "Pengguna diperbarui" });
  } catch (error) {
    console.error("Users PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user || user.deletedAt) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

    // Cegah hapus diri sendiri (opsional tapi disarankan)
    // Untuk saat ini kita implementasikan standard soft-delete dulu
    await db.update(users).set({ 
      deletedAt: new Date(),
      status: 'dihapus'
    }).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: `Pengguna ${user.name} berhasil dihapus` });
  } catch (error) {
    console.error("Users DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
