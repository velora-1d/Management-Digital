import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrationPayments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
  try {
    await requireAuth();

    const payments = await db.select({ paymentType: registrationPayments.paymentType, nominal: registrationPayments.nominal })
      .from(registrationPayments)
      .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.isPaid, true), isNull(registrationPayments.deletedAt)));

    const summary: Record<string, { total: number; count: number }> = {};
    let grandTotal = 0;

    payments.forEach(p => {
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
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal mengambil stats" }, { status: 500 });
  }
}
