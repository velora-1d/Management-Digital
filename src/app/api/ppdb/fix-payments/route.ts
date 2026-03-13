import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, registrationPayments, schoolSettings } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, inArray } from "drizzle-orm";

export async function POST() {
  try {
    await requireAuth();

    const accepted = await db.select({ id: ppdbRegistrations.id, name: ppdbRegistrations.name })
      .from(ppdbRegistrations)
      .where(and(eq(ppdbRegistrations.status, "diterima" as any), isNull(ppdbRegistrations.deletedAt)));

    if (accepted.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada pendaftar yang perlu diperbaiki.", fixed: 0 });
    }

    const feeKeys = ["ppdb_fee_daftar", "ppdb_fee_buku", "ppdb_fee_seragam"];
    const settings = await db.select().from(schoolSettings).where(inArray(schoolSettings.key, feeKeys));
    const feeMap: Record<string, number> = {};
    settings.forEach(s => { feeMap[s.key] = Number(s.value) || 0; });

    let fixedCount = 0;

    await db.transaction(async (tx) => {
      for (const reg of accepted) {
        const existingPayments = await tx.select({ id: registrationPayments.id }).from(registrationPayments)
          .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.payableId, reg.id), isNull(registrationPayments.deletedAt)));

        if (existingPayments.length > 0) continue;

        const paymentTypes = [
          { type: "daftar", nominal: feeMap["ppdb_fee_daftar"] || 0 },
          { type: "buku", nominal: feeMap["ppdb_fee_buku"] || 0 },
          { type: "seragam", nominal: feeMap["ppdb_fee_seragam"] || 0 },
        ];

        await tx.insert(registrationPayments).values(
          paymentTypes.map(pt => ({
            payableType: "ppdb",
            payableId: reg.id,
            paymentType: pt.type,
            nominal: pt.nominal,
            isPaid: false,
            unitId: "",
          }))
        );
        fixedCount++;
      }
    });

    return NextResponse.json({
      success: true,
      message: `${fixedCount} pendaftar berhasil diperbaiki. ${accepted.length - fixedCount} sudah punya data pembayaran.`,
      fixed: fixedCount,
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal memperbaiki data pembayaran" }, { status: 500 });
  }
}
