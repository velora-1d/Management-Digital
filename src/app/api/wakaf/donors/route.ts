import { NextResponse } from "next/server";
import { db } from "@/db";
import { wakafDonors } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, asc, eq, and } from "drizzle-orm";

export async function GET() {
  try {
    await requireAuth();
    const donors = await db.select().from(wakafDonors).where(isNull(wakafDonors.deletedAt)).orderBy(asc(wakafDonors.name));
    return NextResponse.json({ success: true, data: donors });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal memuat donatur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, phone, address } = body;
    if (!name || !name.trim()) return NextResponse.json({ success: false, message: "Nama donatur wajib diisi" }, { status: 400 });

    const [donor] = await db.insert(wakafDonors).values({
      name: name.trim(), phone: phone || "", address: address || "", unitId: user.unitId || "",
    }).returning();

    return NextResponse.json({ success: true, message: "Donatur berhasil ditambahkan.", data: donor });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal menambah donatur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, name, phone, address } = body;
    if (!id || !name) return NextResponse.json({ success: false, message: "ID dan Nama wajib diisi" }, { status: 400 });

    const [updated] = await db.update(wakafDonors).set({
      name: name.trim(), phone: phone || "", address: address || "", updatedAt: new Date(),
    }).where(and(eq(wakafDonors.id, Number(id)), isNull(wakafDonors.deletedAt))).returning();

    if (!updated) return NextResponse.json({ success: false, message: "Donatur tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Donatur berhasil diperbarui.", data: updated });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal memperbarui donatur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID wajib diisi" }, { status: 400 });

    await db.update(wakafDonors).set({ deletedAt: new Date() }).where(eq(wakafDonors.id, Number(id)));

    return NextResponse.json({ success: true, message: "Donatur berhasil dihapus." });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal menghapus donatur" }, { status: 500 });
  }
}
