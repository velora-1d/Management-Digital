import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/wakaf/purposes — List tujuan wakaf
 * POST /api/wakaf/purposes — Tambah tujuan wakaf
 * DELETE /api/wakaf/purposes — Hapus tujuan wakaf (body: { id })
 */

export async function GET() {
  try {
    await requireAuth();
    const purposes = await prisma.wakafPurpose.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: purposes });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat tujuan wakaf" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama tujuan wajib diisi" }, { status: 400 });
    }

    const purpose = await prisma.wakafPurpose.create({
      data: {
        name: name.trim(),
        description: description || "",
        unitId: user.unitId || "",
      },
    });

    return NextResponse.json({ success: true, message: "Tujuan wakaf berhasil ditambahkan.", data: purpose });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menambah tujuan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID wajib diisi" }, { status: 400 });
    }

    // Cek apakah masih dipakai
    const used = await prisma.generalTransaction.count({
      where: { wakafPurposeId: Number(id), deletedAt: null },
    });

    if (used > 0) {
      return NextResponse.json({
        success: false,
        message: `Tujuan ini masih digunakan oleh ${used} transaksi. Tidak bisa dihapus.`,
      }, { status: 400 });
    }

    await prisma.wakafPurpose.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Tujuan wakaf berhasil dihapus." });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus tujuan" }, { status: 500 });
  }
}
