import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, inArray } from "drizzle-orm";

const KEYS = ["ppdb_fee_daftar", "ppdb_fee_buku", "ppdb_fee_seragam"];

export async function GET() {
  try {
    await requireAuth();
    const settings = await db.select().from(schoolSettings).where(inArray(schoolSettings.key, KEYS));
    const map: Record<string, number> = {};
    settings.forEach(s => { map[s.key] = Number(s.value) || 0; });

    return NextResponse.json({
      success: true,
      data: { daftar: map["ppdb_fee_daftar"] || 0, buku: map["ppdb_fee_buku"] || 0, seragam: map["ppdb_fee_seragam"] || 0 },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal mengambil settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { daftar, buku, seragam } = body;

    const updates = [
      { key: "ppdb_fee_daftar", value: String(daftar || 0) },
      { key: "ppdb_fee_buku", value: String(buku || 0) },
      { key: "ppdb_fee_seragam", value: String(seragam || 0) },
    ];

    for (const u of updates) {
      const [existing] = await db.select({ id: schoolSettings.id }).from(schoolSettings).where(eq(schoolSettings.key, u.key)).limit(1);
      if (existing) {
        await db.update(schoolSettings).set({ value: u.value, updatedAt: new Date() }).where(eq(schoolSettings.id, existing.id));
      } else {
        await db.insert(schoolSettings).values({ key: u.key, value: u.value, unitId: user.unitId || "" });
      }
    }

    return NextResponse.json({ success: true, message: "Settings biaya PPDB berhasil disimpan." });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal menyimpan settings" }, { status: 500 });
  }
}
