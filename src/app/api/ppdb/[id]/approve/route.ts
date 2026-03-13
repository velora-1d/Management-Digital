import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, registrationPayments, schoolSettings } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const [reg] = await tx.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
      if (!reg) throw new Error("Pendaftar tidak ditemukan");
      if (reg.deletedAt) throw new Error("Data sudah dihapus");
      if (reg.status === "diterima") throw new Error("Pendaftar sudah diterima sebelumnya");
      if (reg.status === "ditolak") throw new Error("Pendaftar sudah ditolak. Reset dulu sebelum menerima.");

      const feeKeys = ["ppdb_fee_daftar", "ppdb_fee_buku", "ppdb_fee_seragam"];
      const settings = await tx.select().from(schoolSettings).where(inArray(schoolSettings.key, feeKeys));
      const feeMap: Record<string, number> = {};
      settings.forEach(s => { feeMap[s.key] = Number(s.value) || 0; });

      await tx.update(ppdbRegistrations).set({ status: "diterima" as any, updatedAt: new Date() }).where(eq(ppdbRegistrations.id, regId));

      const paymentTypes = [
        { type: "daftar", nominal: feeMap["ppdb_fee_daftar"] || 0 },
        { type: "buku", nominal: feeMap["ppdb_fee_buku"] || 0 },
        { type: "seragam", nominal: feeMap["ppdb_fee_seragam"] || 0 },
      ];

      await tx.insert(registrationPayments).values(
        paymentTypes.map(pt => ({
          payableType: "ppdb",
          payableId: regId,
          paymentType: pt.type,
          nominal: pt.nominal,
          isPaid: false,
          unitId: user.unitId || "",
        }))
      );

      return { name: reg.name };
    });

    return NextResponse.json({ success: true, message: `${result.name} berhasil diterima. Payment items telah dibuat.` });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    const msg = error instanceof Error ? error.message : "Gagal menerima pendaftar";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
