import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

/**
 * GET /api/journal/export — Export jurnal ke CSV
 * Query: ?type= (in/out)
 */
export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: any = { deletedAt: null };
    if (type) where.type = type;

    const entries = await prisma.generalTransaction.findMany({
      where,
      include: {
        category: { select: { name: true } },
        cashAccount: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = entries.map((e, i) => ({
      no: i + 1,
      tanggal: e.date || "-",
      tipe: e.type === "in" ? "Pemasukan" : "Pengeluaran",
      keterangan: (e.description || "").replace(/"/g, '""'),
      kategori: e.category?.name || "-",
      akun_kas: e.cashAccount?.name || "-",
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
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Gagal export" }, { status: 500 });
  }
}
