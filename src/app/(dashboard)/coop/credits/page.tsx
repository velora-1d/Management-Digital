"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { ReceiptText } from "lucide-react";

interface Credit { id: number; studentId: number; amount: number; paidAmount: number; status: string; dueDate: string; student?: { name: string; nis: string } | null; transaction?: { date: string; total: number } | null; }

const statusColors: Record<string, string> = { belum_lunas: "bg-rose-100 text-rose-700", cicil: "bg-amber-100 text-amber-700", lunas: "bg-emerald-100 text-emerald-700" };
const statusLabels: Record<string, string> = { belum_lunas: "Belum Lunas", cicil: "Cicilan", lunas: "Lunas" };

export default function CoopCreditsPage() {
  const [data, setData] = useState<Credit[]>([]);
  const [totalPiutang, setTotalPiutang] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("belum_lunas");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `?status=${filter}` : "";
      const res = await fetch(`/api/coop/credits${q}`);
      const d = await res.json();
      setData(d.credits || []);
      setTotalPiutang(d.totalPiutang || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBayar = async (credit: Credit) => {
    const sisa = credit.amount - credit.paidAmount;
    const { value } = await Swal.fire({
      title: "Bayar Piutang",
      html: `
        <p class="text-sm text-gray-600 mb-2">${credit.student?.name} — Sisa: <b>Rp ${sisa.toLocaleString("id-ID")}</b></p>
        <input id="swal-input" type="number" class="swal2-input" placeholder="Nominal pembayaran" max="${sisa}" />
      `,
      showCancelButton: true,
      confirmButtonText: "Bayar",
      preConfirm: () => {
        const val = (document.getElementById("swal-input") as HTMLInputElement)?.value;
        if (!val || parseFloat(val) <= 0) { Swal.showValidationMessage("Nominal harus > 0"); return; }
        if (parseFloat(val) > sisa) { Swal.showValidationMessage(`Maks Rp ${sisa.toLocaleString("id-ID")}`); return; }
        return val;
      },
    });
    if (!value) return;

    await fetch(`/api/coop/credits/${credit.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paidAmount: parseFloat(value) }),
    });
    Swal.fire("Berhasil", "Pembayaran dicatat", "success");
    fetchData();
  };

  const activeCount = data.filter(d => d.status !== "lunas").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Piutang Siswa"
        subtitle="Kelola bon dan pelunasan"
        icon={<ReceiptText />}
        gradient="from-indigo-500 to-blue-600"
      />

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-sm p-5 text-white">
          <p className="text-xs opacity-80 uppercase tracking-wider">Total Piutang Aktif</p>
          <p className="text-2xl font-bold mt-1">Rp {totalPiutang.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Siswa Berhutang</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Total Catatan</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{data.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 flex gap-1 max-w-sm">
        {[{ v: "belum_lunas", l: "Belum Lunas" }, { v: "cicil", l: "Cicilan" }, { v: "lunas", l: "Lunas" }, { v: "", l: "Semua" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${filter === f.v ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>{f.l}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-sm text-slate-500">Tidak ada data piutang</p></div>
      ) : (
        <div className="space-y-2">
          {data.map(c => {
            const sisa = c.amount - c.paidAmount;
            const persen = c.amount > 0 ? Math.round((c.paidAmount / c.amount) * 100) : 0;
            return (
              <Card key={c.id} className="p-4 hover:border-indigo-100 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{c.student?.name || "-"}</p>
                      <span className="text-[10px] text-slate-400">NIS: {c.student?.nis}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-slate-500">Hutang: <b className="text-slate-800">Rp {c.amount.toLocaleString("id-ID")}</b></span>
                      <span className="text-xs text-slate-500">Dibayar: <b className="text-emerald-600">Rp {c.paidAmount.toLocaleString("id-ID")}</b></span>
                      <span className="text-xs text-slate-500">Sisa: <b className="text-rose-600">Rp {sisa.toLocaleString("id-ID")}</b></span>
                    </div>
                    {c.status !== "lunas" && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-xs"><div className={`h-1.5 rounded-full ${persen >= 100 ? "bg-emerald-500" : persen >= 50 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${persen}%` }}></div></div>
                        <span className="text-[10px] font-semibold text-slate-500">{persen}%</span>
                      </div>
                    )}
                  </div>
                  {c.status !== "lunas" && (
                    <button onClick={() => handleBayar(c)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-100 transition-colors shrink-0">Bayar</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
