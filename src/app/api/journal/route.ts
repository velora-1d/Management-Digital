import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));

  try {
    const where: any = { deletedAt: null };
    if (typeFilter) where.type = typeFilter;

    // KPI: hitung menggunakan aggregate (100x lebih cepat dari findMany + loop)
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [transactions, totalCount, categories, totalInAgg, totalOutAgg, thisMonthInAgg, thisMonthOutAgg] = await Promise.all([
      prisma.generalTransaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.generalTransaction.count({ where }),
      prisma.transactionCategory.findMany({
        where: { deletedAt: null },
      }),
      // KPI aggregate: total pemasukan
      prisma.generalTransaction.aggregate({
        where: { deletedAt: null, type: "in" },
        _sum: { amount: true },
      }),
      // KPI aggregate: total pengeluaran
      prisma.generalTransaction.aggregate({
        where: { deletedAt: null, type: "out" },
        _sum: { amount: true },
      }),
      // KPI aggregate: pemasukan bulan ini
      prisma.generalTransaction.aggregate({
        where: { deletedAt: null, type: "in", date: { startsWith: currentMonthPrefix } },
        _sum: { amount: true },
      }),
      // KPI aggregate: pengeluaran bulan ini
      prisma.generalTransaction.aggregate({
        where: { deletedAt: null, type: "out", date: { startsWith: currentMonthPrefix } },
        _sum: { amount: true },
      }),
    ]);

    const totalIn = totalInAgg._sum.amount || 0;
    const totalOut = totalOutAgg._sum.amount || 0;
    const thisMonthIn = thisMonthInAgg._sum.amount || 0;
    const thisMonthOut = thisMonthOutAgg._sum.amount || 0;

    const entries = transactions.map(tx => ({
      id: tx.id,
      date: tx.date || tx.createdAt.toISOString(),
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      category_name: tx.category?.name || "-",
      status: tx.status || "valid",
    }));

    const kpi = { totalBalance: totalIn - totalOut, thisMonthIn, thisMonthOut };

    return NextResponse.json({
      success: true,
      kpi,
      entries,
      categories,
      pagination: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    console.error("Journal GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
