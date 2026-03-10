import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/wakaf/donors — List donatur wakaf
 * POST /api/wakaf/donors — Tambah donatur wakaf
 */

export async function GET() {
  try {
    await requireAuth();
    const donors = await prisma.wakafDonor.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: donors });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat donatur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama donatur wajib diisi" }, { status: 400 });
    }

    const donor = await prisma.wakafDonor.create({
      data: {
        name: name.trim(),
        phone: phone || "",
        address: address || "",
        unitId: user.unitId || "",
      },
    });

    return NextResponse.json({ success: true, message: "Donatur berhasil ditambahkan.", data: donor });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menambah donatur" }, { status: 500 });
  }
}
