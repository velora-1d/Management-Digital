import { NextResponse } from "next/server";
import { db } from "@/db";
import { coopTransactions, students, products, studentCredits } from "@/db/schema";
import { eq, like, desc, and, sql, inArray } from "drizzle-orm";

// GET /api/coop/transactions?date=YYYY-MM-DD&month=3&year=2026&paymentMethod=tunai
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const paymentMethod = searchParams.get("paymentMethod");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const conditions = [];
    if (date) {
      conditions.push(like(coopTransactions.date, `${date}%`));
    } else if (month && year) {
      const prefix = `${year}-${String(parseInt(month)).padStart(2, "0")}`;
      conditions.push(like(coopTransactions.date, `${prefix}%`));
    }
    if (paymentMethod) {
      conditions.push(eq(coopTransactions.paymentMethod, paymentMethod as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, [{ total }]] = await Promise.all([
      db.select({
        id: coopTransactions.id,
        studentId: coopTransactions.studentId,
        items: coopTransactions.items,
        total: coopTransactions.total,
        paymentMethod: coopTransactions.paymentMethod,
        date: coopTransactions.date,
        createdAt: coopTransactions.createdAt,
        updatedAt: coopTransactions.updatedAt,
        student: {
          id: students.id,
          name: students.name,
          nis: students.nis,
        }
      })
      .from(coopTransactions)
      .leftJoin(students, eq(coopTransactions.studentId, students.id))
      .where(whereClause)
      .orderBy(desc(coopTransactions.createdAt))
      .limit(limit)
      .offset(skip),
      
      db.select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(coopTransactions)
      .where(whereClause)
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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

    // Validasi stok - ⚡ Bolt: Removed N+1 query by batch fetching products
    const productIds = Array.from(new Set(items.map((i: any) => parseInt(i.productId))));

    let productMap = new Map();
    if (productIds.length > 0) {
      const fetchedProducts = await db.select().from(products).where(inArray(products.id, productIds));
      for (const p of fetchedProducts) {
        productMap.set(p.id, p);
      }
    }

    for (const item of items) {
      const product = productMap.get(parseInt(item.productId));
      if (!product) return NextResponse.json({ error: `Produk ID ${item.productId} tidak ditemukan` }, { status: 400 });
      if (product.stok < parseInt(item.qty)) return NextResponse.json({ error: `Stok ${product.name} tidak cukup (sisa: ${product.stok})` }, { status: 400 });
    }

    // Hitung total
    const total = items.reduce((sum: number, i: { price: number; qty: number }) => sum + (parseFloat(String(i.price)) * parseInt(String(i.qty))), 0);
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 19);

    // Jalankan dalam Transaksi (ACID Compliance)
    const trx = await db.transaction(async (tx) => {
      // 1. Buat transaksi
      const [t] = await tx.insert(coopTransactions).values({
        studentId: studentId ? parseInt(studentId) : null,
        items: JSON.stringify(items),
        total,
        paymentMethod: paymentMethod || "tunai",
        date: dateStr,
      }).returning();

      // 2. Kurangi stok
      for (const item of items) {
        await tx.update(products)
          .set({ stok: sql`${products.stok} - ${parseInt(item.qty)}` })
          .where(eq(products.id, parseInt(item.productId)));
      }

      // 3. Jika bon, catat piutang
      if (paymentMethod === "bon" && studentId) {
        await tx.insert(studentCredits).values({
          studentId: parseInt(studentId),
          transactionId: t.id,
          amount: total,
          paidAmount: 0,
          status: "belum_lunas",
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
