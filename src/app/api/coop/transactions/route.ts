import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coop/transactions?date=YYYY-MM-DD&month=3&year=2026&paymentMethod=tunai
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const paymentMethod = searchParams.get("paymentMethod");

    const where: Record<string, unknown> = {};
    if (date) {
      where.date = { startsWith: date };
    } else if (month && year) {
      const prefix = `${year}-${String(parseInt(month)).padStart(2, "0")}`;
      where.date = { startsWith: prefix };
    }
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const data = await prisma.coopTransaction.findMany({
      where,
      include: { student: { select: { id: true, name: true, nis: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat transaksi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/coop/transactions — Buat transaksi baru + kurangi stok + catat piutang jika bon
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, items, paymentMethod } = body;
    // items: [{productId, qty, price}]

    if (!items?.length) return NextResponse.json({ error: "Item transaksi wajib" }, { status: 400 });

    // Validasi stok
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: parseInt(item.productId) } });
      if (!product) return NextResponse.json({ error: `Produk ID ${item.productId} tidak ditemukan` }, { status: 400 });
      if (product.stok < parseInt(item.qty)) return NextResponse.json({ error: `Stok ${product.name} tidak cukup (sisa: ${product.stok})` }, { status: 400 });
    }

    // Hitung total
    const total = items.reduce((sum: number, i: { price: number; qty: number }) => sum + (parseFloat(String(i.price)) * parseInt(String(i.qty))), 0);
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 19);

    // Jalankan dalam Transaksi (ACID Compliance)
    const trx = await prisma.$transaction(async (tx) => {
      // 1. Buat transaksi
      const t = await tx.coopTransaction.create({
        data: {
          studentId: studentId ? parseInt(studentId) : null,
          items: JSON.stringify(items),
          total,
          paymentMethod: paymentMethod || "tunai",
          date: dateStr,
        },
      });

      // 2. Kurangi stok
      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: { stok: { decrement: parseInt(item.qty) } },
        });
      }

      // 3. Jika bon, catat piutang
      if (paymentMethod === "bon" && studentId) {
        await tx.studentCredit.create({
          data: {
            studentId: parseInt(studentId),
            transactionId: t.id,
            amount: total,
            paidAmount: 0,
            status: "belum_lunas",
          },
        });
      }

      return t;
    });

    return NextResponse.json(trx, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat transaksi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
