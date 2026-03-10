import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * POST /api/ppdb/[id]/reset — Reset pendaftar ke "menunggu"
 */
export async function POST(
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
    if (reg.status === "menunggu" || reg.status === "pending") {
      return NextResponse.json({ success: false, message: "Status sudah menunggu" }, { status: 400 });
    }
    if (reg.status === "converted") {
      return NextResponse.json({ success: false, message: "Tidak bisa reset pendaftar yang sudah dikonversi ke siswa" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const paidItems = await tx.registrationPayment.findMany({
        where: { payableType: "ppdb", payableId: regId, isPaid: true, deletedAt: null }
      });

      if (paidItems.length > 0) {
        throw new Error("Penerimaan tak bisa dibatalkan karena ada tagihan biaya yang sudah lunas. Harap batalkan pembayaran tersebut terlebih dahulu.");
      }

      await tx.registrationPayment.deleteMany({
        where: { payableType: "ppdb", payableId: regId, isPaid: false }
      });

      await tx.ppdbRegistration.update({
        where: { id: regId },
        data: { status: "menunggu" },
      });
    });

    return NextResponse.json({
      success: true,
      message: `${reg.name} direset ke status menunggu.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    const msg = error instanceof Error ? error.message : "Gagal reset pendaftar";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
