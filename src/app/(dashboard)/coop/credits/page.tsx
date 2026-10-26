"use client";
import { useState, useEffect, useCallback } from "react";
import { ExportButtons } from "@/lib/export-utils";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { ReceiptText, CheckCircle2 } from "lucide-react";
import Pagination from "@/components/Pagination";

interface Credit { id: number; studentId: number; amount: number; paidAmount: number; status: string; dueDate: string; student?: { name: string; nis: string } | null; transaction?: { date: string; total: number } | null; }

const statusColors: Record<string, string> = { belum_lunas: "bg-rose-100 text-rose-700", cicil: "bg-amber-100 text-amber-700", lunas: "bg-emerald-100 text-emerald-700" };
const statusLabels: Record<string, string> = { belum_lunas: "Belum Lunas", cicil: "Cicilan", lunas: "Lunas" };

export default function CoopCreditsPage() {
  const [data, setData] = useState<Credit[]>([]);
  const [totalPiutang, setTotalPiutang] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("belum_lunas");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Drawer Bayar Piutang
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [bayarAmount, setBayarAmount] = useState("");
  const [bayarLoading, setBayarLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter ? `status=${filter}&` : "";
      const res = await fetch(`/api/coop/credits?${q}page=${page}&limit=${limit}`);
      const d = await res.json();
      setData(d.data || d.credits || []);
      setTotalPiutang(d.totalPiutang || 0);
      setPagination({
        total: d.total || (d.credits ? d.credits.length : 0),
        totalPages: d.totalPages || 1
      });
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter, page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const openBayarDrawer = (credit: Credit) => {
    const sisa = credit.amount - credit.paidAmount;
    setSelectedCredit(credit);
    setBayarAmount(String(sisa));
    setDrawerOpen(true);
  };

  const handleSubmitBayar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;
    const sisa = selectedCredit.amount - selectedCredit.paidAmount;
    const num = parseFloat(bayarAmount);
    if (!num || num <= 0) {
      Swal.fire("Error", "Nominal harus > 0", "error");
      return;
    }
    if (num > sisa) {
      Swal.fire("Error", `Maksimal pembayaran Rp ${sisa.toLocaleString("id-ID")}`, "error");
      return;
    }

    setBayarLoading(true);
    try {
      const res = await fetch(`/api/coop/credits/${selectedCredit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAmount: num }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghubungi server");
      }
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", "Pembayaran piutang berhasil dicatat", "success");
        setDrawerOpen(false);
        setSelectedCredit(null);
        fetchData();
      } else {
        Swal.fire("Gagal", json.message || "Gagal memproses pembayaran", "error");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
      Swal.fire("Error", msg, "error");
    } finally {
      setBayarLoading(false);
    }
  };

  const activeCount = data.filter(d => d.status !== "lunas").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Piutang Siswa"
        subtitle="Kelola bon dan pelunasan"
        icon={<ReceiptText className="w-5 h-5 text-blue-600" />}
        actions={
          <ExportButtons 
            options={{
              title: "Daftar Piutang Siswa Koperasi",
              subtitle: `Status: ${statusLabels[filter] || 'Semua'} | Total Piutang Aktif: Rp ${totalPiutang.toLocaleString("id-ID")}`,
              filename: `piutang_siswa_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 10, align: "center" },
                { header: "Nama Siswa", key: "student_name", width: 45 },
                { header: "NIS", key: "student_nis", width: 20 },
                { header: "Total Hutang", key: "amount", width: 25, align: "right", format: (v: number) => `Rp ${v.toLocaleString("id-ID")}` },
                { header: "Dibayar", key: "paidAmount", width: 25, align: "right", format: (v: number) => `Rp ${v.toLocaleString("id-ID")}` },
                { header: "Sisa", key: "sisa", width: 25, align: "right", format: (v: number) => `Rp ${v.toLocaleString("id-ID")}` },
                { header: "Status", key: "status", width: 25, align: "center", format: (v: string) => statusLabels[v] || String(v) },
                { header: "Jatuh Tempo", key: "dueDate", width: 25, align: "center" },
              ],
              data: data.map((c, i) => ({
                ...c,
                _no: ((page - 1) * limit) + i + 1,
                student_name: c.student?.name || "-",
                student_nis: c.student?.nis || "-",
                sisa: c.amount - c.paidAmount
              }))
            }}
          />
        }
      />

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 border-l-rose-500">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Total Piutang Aktif</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">Rp {totalPiutang.toLocaleString("id-ID")}</p>
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
          <button key={f.v} onClick={() => setFilter(f.v)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${filter === f.v ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>{f.l}</button>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{selectedIds.length} piutang dipilih</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-sm text-slate-500">Tidak ada data piutang</p></div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-4 border-b border-slate-200 text-center w-10">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? data.map(c => c.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua piutang"
                    />
                  </th>
                  <th className="px-4 py-4 border-b border-slate-200 text-center w-12">No</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nama Siswa</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Total Hutang</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Dibayar</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Sisa Piutang</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Pelunasan</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Status</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => {
                  const sisa = c.amount - c.paidAmount;
                  const persen = c.amount > 0 ? Math.round((c.paidAmount / c.amount) * 100) : 0;
                  const isSelected = selectedIds.includes(c.id);

                  return (
                    <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, c.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== c.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-slate-400 font-mono">
                        {((page - 1) * limit) + i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800">{c.student?.name || "-"}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIS: {c.student?.nis || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-slate-700 font-mono">
                        Rp {c.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-emerald-600 font-mono">
                        Rp {c.paidAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-extrabold text-rose-600 font-mono">
                        Rp {sisa.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${persen >= 100 ? "bg-emerald-500" : persen >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                              style={{ width: `${Math.min(100, persen)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 font-mono">{persen}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColors[c.status] || "bg-slate-100 text-slate-600"}`}>
                          {statusLabels[c.status] || c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {c.status !== "lunas" ? (
                          <button
                            onClick={() => openBayarDrawer(c)}
                            className="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Bayar
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-600">Lunas</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}

      {/* Drawer Bayar Piutang (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={drawerOpen && !!selectedCredit}
        onClose={() => { setDrawerOpen(false); setSelectedCredit(null); }}
        title="Bayar Piutang Siswa"
        subtitle={selectedCredit ? `${selectedCredit.student?.name} (NIS: ${selectedCredit.student?.nis})` : ""}
        width="max-w-md"
      >
        {selectedCredit && (() => {
          const sisa = selectedCredit.amount - selectedCredit.paidAmount;
          return (
            <form onSubmit={handleSubmitBayar} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Hutang:</span>
                  <span className="font-bold text-slate-700">Rp {selectedCredit.amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Telah Dibayar:</span>
                  <span className="font-bold text-emerald-600">Rp {selectedCredit.paidAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-600">Sisa Tagihan:</span>
                  <span className="text-rose-600 text-sm">Rp {sisa.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">Nominal Pembayaran (Rp) *</label>
                  <button
                    type="button"
                    onClick={() => setBayarAmount(String(sisa))}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Bayar Lunas
                  </button>
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  max={sisa}
                  value={bayarAmount}
                  onChange={e => setBayarAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-base font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Maksimal pembayaran Rp {sisa.toLocaleString("id-ID")}</p>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); setSelectedCredit(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bayarLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  {bayarLoading ? "Memproses..." : "Simpan Pembayaran"}
                </button>
              </div>
            </form>
          );
        })()}
      </LeftDrawer>
    </div>
  );
}
