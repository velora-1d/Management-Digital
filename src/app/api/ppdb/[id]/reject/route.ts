import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq } from "drizzle-orm";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const [reg] = await db.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
    if (!reg || reg.deletedAt) return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    if (reg.status === "ditolak") return NextResponse.json({ success: false, message: "Sudah ditolak sebelumnya" }, { status: 400 });

    await db.update(ppdbRegistrations).set({ status: "ditolak" as any, updatedAt: new Date() }).where(eq(ppdbRegistrations.id, regId));

    return NextResponse.json({ success: true, message: `${reg.name} ditolak.` });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal menolak pendaftar" }, { status: 500 });
  }
}
