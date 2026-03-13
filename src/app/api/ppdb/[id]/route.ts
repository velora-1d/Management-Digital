import { NextResponse } from "next/server";
import { db } from "@/db";
import { ppdbRegistrations, registrationPayments } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { eq, and, isNull, sql, asc } from "drizzle-orm";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const [reg] = await db.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
    if (!reg || reg.deletedAt) return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });

    const payments = await db.select().from(registrationPayments)
      .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.payableId, regId), isNull(registrationPayments.deletedAt)))
      .orderBy(asc(registrationPayments.createdAt));

    return NextResponse.json({ success: true, data: { ...reg, payments } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal memuat detail" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const [reg] = await db.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
    if (!reg || reg.deletedAt) return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });

    const [{ paidCount }] = await db.select({ paidCount: sql<number>`count(*)`.mapWith(Number) })
      .from(registrationPayments)
      .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.payableId, regId), eq(registrationPayments.isPaid, true), isNull(registrationPayments.deletedAt)));

    if (paidCount > 0) {
      return NextResponse.json({ success: false, message: "Tidak bisa dihapus — sudah ada pembayaran lunas." }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      await tx.update(ppdbRegistrations).set({ deletedAt: new Date() }).where(eq(ppdbRegistrations.id, regId));
      await tx.update(registrationPayments).set({ deletedAt: new Date() })
        .where(and(eq(registrationPayments.payableType, "ppdb"), eq(registrationPayments.payableId, regId), isNull(registrationPayments.deletedAt)));
    });

    return NextResponse.json({ success: true, message: `Pendaftar ${reg.name} berhasil dihapus` });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal menghapus pendaftar" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const params = await props.params;
    const regId = Number(params.id);
    if (isNaN(regId)) return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });

    const [reg] = await db.select().from(ppdbRegistrations).where(eq(ppdbRegistrations.id, regId)).limit(1);
    if (!reg || reg.deletedAt) return NextResponse.json({ success: false, message: "Pendaftar tidak ditemukan" }, { status: 404 });

    const body = await request.json();
    const data = { ...body };
    if (data.height) data.height = Number(data.height);
    if (data.weight) data.weight = Number(data.weight);
    if (data.siblingCount) data.siblingCount = Number(data.siblingCount);
    if (data.childPosition) data.childPosition = Number(data.childPosition);
    if (data.travelTime) data.travelTime = Number(data.travelTime);
    delete data.id; delete data.createdAt; delete data.updatedAt; delete data.deletedAt; delete data.payments;
    data.updatedAt = new Date();

    const [updated] = await db.update(ppdbRegistrations).set(data).where(eq(ppdbRegistrations.id, regId)).returning();
    return NextResponse.json({ success: true, message: `Data pendaftar ${updated.name} berhasil diperbarui`, data: updated });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    console.error("PUT /api/ppdb/[id] Error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan perubahan" }, { status: 500 });
  }
}
