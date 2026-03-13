import { NextResponse } from "next/server";
import { db } from "@/db";
import { wakafDonors } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, asc } from "drizzle-orm";

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
