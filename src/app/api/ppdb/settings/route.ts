import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/ppdb/settings — Ambil settings biaya PPDB
 * PUT /api/ppdb/settings — Update settings biaya PPDB
 * Menggunakan model SchoolSetting (key-value store)
 */

const KEYS = ["ppdb_fee_daftar", "ppdb_fee_buku", "ppdb_fee_seragam"];

export async function GET() {
  try {
    await requireAuth();
    const settings = await prisma.schoolSetting.findMany({
      where: { key: { in: KEYS } },
    });

    const map: Record<string, number> = {};
    settings.forEach((s: any) => { map[s.key] = Number(s.value) || 0; });

    return NextResponse.json({
      success: true,
      data: {
        daftar: map["ppdb_fee_daftar"] || 0,
        buku: map["ppdb_fee_buku"] || 0,
        seragam: map["ppdb_fee_seragam"] || 0,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
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

    // Upsert via findFirst + create/update karena key belum @@unique
    for (const u of updates) {
      const existing = await prisma.schoolSetting.findFirst({
        where: { key: u.key },
      });

      if (existing) {
        await prisma.schoolSetting.update({
          where: { id: existing.id },
          data: { value: u.value },
        });
      } else {
        await prisma.schoolSetting.create({
          data: { key: u.key, value: u.value, unitId: user.unitId || "" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settings biaya PPDB berhasil disimpan.",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menyimpan settings" }, { status: 500 });
  }
}
