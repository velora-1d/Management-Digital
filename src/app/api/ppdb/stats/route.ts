import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/ppdb/stats — Rekap penerimaan kas PPDB per jenis
 * Menghitung total nominal yang sudah dibayar per paymentType
 */
export async function GET() {
  try {
    await requireAuth();

    const payments = await prisma.registrationPayment.findMany({
      where: {
        payableType: "ppdb",
        isPaid: true,
        deletedAt: null,
      },
      select: {
        paymentType: true,
        nominal: true,
      },
    });

    const summary: Record<string, { total: number; count: number }> = {};
    let grandTotal = 0;

    payments.forEach((p) => {
      const type = p.paymentType;
      if (!summary[type]) summary[type] = { total: 0, count: 0 };
      summary[type].total += Number(p.nominal) || 0;
      summary[type].count += 1;
      grandTotal += Number(p.nominal) || 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        daftar: summary["daftar"] || { total: 0, count: 0 },
        buku: summary["buku"] || { total: 0, count: 0 },
        seragam: summary["seragam"] || { total: 0, count: 0 },
        // backward compat: include "formulir" under "daftar" key
        ...(summary["formulir"] ? {
          daftar: {
            total: (summary["daftar"]?.total || 0) + (summary["formulir"]?.total || 0),
            count: (summary["daftar"]?.count || 0) + (summary["formulir"]?.count || 0),
          }
        } : {}),
        grandTotal,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal mengambil stats" }, { status: 500 });
  }
}
