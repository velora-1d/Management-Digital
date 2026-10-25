import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/school-profile
export async function GET() {
  try {
    const settings = await db.select().from(schoolSettings);
    const profile: Record<string, string> = {};
    settings.forEach(s => { profile[s.key] = s.value; });
    return NextResponse.json(profile);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat profil sekolah";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/school-profile
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const entries = Object.entries(body) as [string, string][];

    await db.transaction(async (tx) => {
      for (const [key, value] of entries) {
        const [existing] = await tx.select().from(schoolSettings).where(eq(schoolSettings.key, key)).limit(1);
        if (existing) {
          await tx.update(schoolSettings).set({ value: String(value) }).where(eq(schoolSettings.id, existing.id));
        } else {
          await tx.insert(schoolSettings).values({ key, value: String(value) });
        }
      }
    });

    return NextResponse.json({ message: "Profil sekolah berhasil diperbarui" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan profil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
