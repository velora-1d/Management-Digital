import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/ppdb/[id] — Detail pendaftar PPDB
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);

    if (isNaN(regId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const reg = await prisma.ppdbRegistration.findUnique({ where: { id: regId } });
    if (!reg || reg.deletedAt) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    // Ambil payment items terkait
    const payments = await prisma.registrationPayment.findMany({
      where: { payableType: "ppdb", payableId: regId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { ...reg, payments },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal memuat detail" }, { status: 500 });
  }
}

/**
 * DELETE /api/ppdb/[id] — Hapus (soft delete) pendaftar PPDB
 * Hanya boleh jika belum ada pembayaran lunas
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);

    if (isNaN(regId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const reg = await prisma.ppdbRegistration.findUnique({ where: { id: regId } });
    if (!reg || reg.deletedAt) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah ada pembayaran yang sudah lunas
    const paidPayments = await prisma.registrationPayment.count({
      where: { payableType: "ppdb", payableId: regId, isPaid: true, deletedAt: null },
    });

    if (paidPayments > 0) {
      return NextResponse.json(
        { success: false, message: "Tidak bisa dihapus — sudah ada pembayaran lunas. Revert pembayaran terlebih dahulu." },
        { status: 400 }
      );
    }

    // Soft delete pendaftar + payment items
    await prisma.$transaction([
      prisma.ppdbRegistration.update({
        where: { id: regId },
        data: { deletedAt: new Date() },
      }),
      prisma.registrationPayment.updateMany({
        where: { payableType: "ppdb", payableId: regId, deletedAt: null },
        data: { deletedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Pendaftar ${reg.name} berhasil dihapus`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus pendaftar" }, { status: 500 });
  }
}

/**
 * PUT /api/ppdb/[id] — Update data pendaftar PPDB
 */
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);

    if (isNaN(regId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const reg = await prisma.ppdbRegistration.findUnique({ where: { id: regId } });
    if (!reg || reg.deletedAt) {
      return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    const body = await request.json();
    
    // Parse angka fields
    const height = body.height ? Number(body.height) : null;
    const weight = body.weight ? Number(body.weight) : null;
    const siblingCount = body.siblingCount ? Number(body.siblingCount) : null;
    const childPosition = body.childPosition ? Number(body.childPosition) : null;
    const travelTime = body.travelTime ? Number(body.travelTime) : null;

    const data = { ...body, height, weight, siblingCount, childPosition, travelTime };
    // Remove id, createdAt, updatedAt if any
    delete data.id; delete data.createdAt; delete data.updatedAt; delete data.deletedAt; delete data.payments;

    const updated = await prisma.ppdbRegistration.update({
      where: { id: regId },
      data,
    });

    return NextResponse.json({
      success: true,
      message: `Data pendaftar ${updated.name} berhasil diperbarui`,
      data: updated
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("PUT /api/ppdb/[id] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan perubahan" }, { status: 500 });
  }
}

