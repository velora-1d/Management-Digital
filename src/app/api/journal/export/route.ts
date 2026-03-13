import { NextResponse } from "next/server";
import { db } from "@/db";
import { generalTransactions, transactionCategories, cashAccounts } from "@/db/schema";
import { requireAuth, AuthError } from "@/lib/rbac";
import { isNull, and, eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const conditions = [isNull(generalTransactions.deletedAt)];
    if (type) conditions.push(eq(generalTransactions.type, type as any));

    const entries = await db.select({
      id: generalTransactions.id,
      date: generalTransactions.date,
      type: generalTransactions.type,
      description: generalTransactions.description,
      amount: generalTransactions.amount,
      status: generalTransactions.status,
      categoryName: transactionCategories.name,
      cashAccountName: cashAccounts.name,
    })
    .from(generalTransactions)
    .leftJoin(transactionCategories, eq(generalTransactions.categoryId, transactionCategories.id))
    .leftJoin(cashAccounts, eq(generalTransactions.cashAccountId, cashAccounts.id))
    .where(and(...conditions))
    .orderBy(desc(generalTransactions.createdAt));

    const rows = entries.map((e, i) => ({
      no: i + 1,
      tanggal: e.date || "-",
      tipe: e.type === "in" ? "Pemasukan" : "Pengeluaran",
      keterangan: (e.description || "").replace(/"/g, '""'),
      kategori: e.categoryName || "-",
      akun_kas: e.cashAccountName || "-",
      jumlah: e.amount,
      status: e.status || "valid",
    }));

    const header = "No,Tanggal,Tipe,Keterangan,Kategori,Akun Kas,Jumlah,Status\n";
    const csv = header + rows.map(r => `${r.no},"${r.tanggal}","${r.tipe}","${r.keterangan}","${r.kategori}","${r.akun_kas}",${r.jumlah},"${r.status}"`).join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jurnal_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    return NextResponse.json({ success: false, message: "Gagal export" }, { status: 500 });
  }
}
