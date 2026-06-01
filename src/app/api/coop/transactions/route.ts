import { NextResponse } from "next/server";
import { db } from "@/db";
import { coopTransactions, students, products, studentCredits, generalTransactions, cashAccounts } from "@/db/schema";
import { eq, like, desc, and, sql, isNull } from "drizzle-orm";
import { requireAuth } from "@/lib/rbac";

type CoopPaymentMethod = typeof coopTransactions.$inferSelect.paymentMethod;
type GeneralTransactionStatus = typeof generalTransactions.$inferSelect.status;

function isMissingColumnError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42703";
}

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

    const conditions = [isNull(coopTransactions.deletedAt)];
    if (date) {
      conditions.push(like(coopTransactions.date, `${date}%`));
    } else if (month && year) {
      const prefix = `${year}-${String(parseInt(month)).padStart(2, "0")}`;
      conditions.push(like(coopTransactions.date, `${prefix}%`));
    }
    if (paymentMethod) {
      conditions.push(eq(coopTransactions.paymentMethod, paymentMethod as CoopPaymentMethod));
    }

    const whereClause = and(...conditions);

    try {
      const [data, [{ total }]] = await Promise.all([
        db.select({
          id: coopTransactions.id,
          studentId: coopTransactions.studentId,
          items: coopTransactions.items,
          total: coopTransactions.total,
          paymentMethod: coopTransactions.paymentMethod,
          date: coopTransactions.date,
          status: coopTransactions.status,
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
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      // Fallback for older databases that do not yet have `status`/`deleted_at`.
      const legacyConditions = [];
      if (date) {
        legacyConditions.push(like(coopTransactions.date, `${date}%`));
      } else if (month && year) {
        const prefix = `${year}-${String(parseInt(month)).padStart(2, "0")}`;
        legacyConditions.push(like(coopTransactions.date, `${prefix}%`));
      }
      if (paymentMethod) {
        legacyConditions.push(eq(coopTransactions.paymentMethod, paymentMethod as CoopPaymentMethod));
      }

      const legacyWhereClause = legacyConditions.length > 0 ? and(...legacyConditions) : undefined;

      const [data, [{ total }]] = await Promise.all([
        db.select({
          id: coopTransactions.id,
          studentId: coopTransactions.studentId,
          items: coopTransactions.items,
          total: coopTransactions.total,
          paymentMethod: coopTransactions.paymentMethod,
          date: coopTransactions.date,
          status: sql<string>`'valid'`,
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
        .where(legacyWhereClause)
        .orderBy(desc(coopTransactions.createdAt))
        .limit(limit)
        .offset(skip),

        db.select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(coopTransactions)
        .where(legacyWhereClause)
      ]);

      return NextResponse.json({
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal memuat transaksi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/coop/transactions — Buat transaksi baru + kurangi stok + catat piutang jika bon
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json(); // FIXED: body definition
    const { studentId, items, paymentMethod, cashAccountId } = body;
    // items: [{productId, qty, price}]

    if (!items?.length) return NextResponse.json({ error: "Item transaksi wajib" }, { status: 400 });

    const total = items.reduce((sum: number, i: { price: number; qty: number }) => sum + (parseFloat(String(i.price)) * parseInt(String(i.qty))), 0);
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 19);

    // Jalankan dalam Transaksi (ACID Compliance)
    const result = await db.transaction(async (tx) => {
      // 1. Validasi stok kembali di dalam transaksi
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, parseInt(item.productId))).limit(1);
        if (!product) throw new Error(`Produk ID ${item.productId} tidak ditemukan`);
        if (product.stok < parseInt(item.qty)) {
          throw new Error(`Stok ${product.name} tidak cukup (sisa: ${product.stok}, diminta: ${item.qty})`);
        }
      }

      // 2. Buat transaksi
      const [t] = await tx.insert(coopTransactions).values({
        studentId: studentId ? parseInt(studentId) : null,
        items: JSON.stringify(items),
        total,
        paymentMethod: paymentMethod || "tunai",
        date: dateStr,
        status: "valid",
        unitId: user.unitId || "",
      }).returning();

      // 3. Kurangi stok
      for (const item of items) {
        await tx.update(products)
          .set({ stok: sql`${products.stok} - ${parseInt(item.qty)}` })
          .where(eq(products.id, parseInt(item.productId)));
      }

      // 4. Jika bon, catat piutang. Jika tunai, catat jurnal + update kas
      if (paymentMethod === "bon" && studentId) {
        await tx.insert(studentCredits).values({
          studentId: parseInt(studentId),
          transactionId: t.id,
          amount: total,
          paidAmount: 0,
          status: "belum_lunas",
        });
      } else if (paymentMethod === "tunai" && cashAccountId) {
        await tx.insert(generalTransactions).values({
          type: "in",
          amount: total,
          cashAccountId: Number(cashAccountId),
          description: `Penjualan Koperasi #${t.id}${studentId ? ` (Siswa ID: ${studentId})` : ""}`,
          transactionDate: now.toISOString().split("T")[0],
          status: "valid",
          referenceType: "coop_transaction",
          referenceId: String(t.id),
          userId: user.userId,
          unitId: user.unitId || "",
        });

        await tx.update(cashAccounts)
          .set({ balance: sql`${cashAccounts.balance} + ${total}` })
          .where(eq(cashAccounts.id, Number(cashAccountId)));
      }

      return t;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membuat transaksi";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/coop/transactions — Batal (Void) Transaksi
export async function DELETE(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID transaksi wajib" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      // 1. Cari transaksi
      const [t] = await tx.select().from(coopTransactions).where(eq(coopTransactions.id, parseInt(id))).limit(1);
      if (!t || t.status === "void") throw new Error("Transaksi tidak ditemukan atau sudah dibatalkan");

      const items = JSON.parse(t.items);

      // 2. Kembalikan stok
      for (const item of items) {
        await tx.update(products)
          .set({ stok: sql`${products.stok} + ${parseInt(item.qty)}` })
          .where(eq(products.id, parseInt(item.productId)));
      }

      // 3. Batalkan piutang (jika bon)
      if (t.paymentMethod === "bon") {
        await tx.delete(studentCredits).where(eq(studentCredits.transactionId, t.id));
      }

      // 4. Batalkan jurnal & update kas (jika tunai)
      if (t.paymentMethod === "tunai") {
        const [gt] = await tx.select().from(generalTransactions)
          .where(and(eq(generalTransactions.referenceType, "coop_transaction"), eq(generalTransactions.referenceId, String(t.id))))
          .limit(1);
        
        if (gt) {
          await tx.update(generalTransactions)
            .set({ status: "void" as GeneralTransactionStatus, deletedAt: new Date() })
            .where(eq(generalTransactions.id, gt.id));

          if (gt.cashAccountId) {
            await tx.update(cashAccounts)
              .set({ balance: sql`${cashAccounts.balance} - ${gt.amount}` })
              .where(eq(cashAccounts.id, gt.cashAccountId));
          }
        }
      }

      // 5. Update status transaksi koperasi
      await tx.update(coopTransactions)
        .set({ status: "void", updatedAt: new Date() })
        .where(eq(coopTransactions.id, t.id));

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal membatalkan transaksi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
