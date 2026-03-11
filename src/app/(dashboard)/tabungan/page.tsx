"use client";
import { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/Pagination";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Wallet } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function TabunganPage() {
  const queryClient = useQueryClient();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modal setor/tarik
  const [showTransaction, setShowTransaction] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [txType, setTxType] = useState<"setor" | "tarik">("setor");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txDesc, setTxDesc] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  // Modal riwayat
  const [showHistory, setShowHistory] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyBalance, setHistoryBalance] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["tabungan", classFilter, page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/tabungan?classId=${classFilter}&page=${page}&limit=${limit}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const data: any[] = queryResult?.data || [];
  const totalPages = queryResult?.pagination?.totalPages || 1;
  const total = queryResult?.pagination?.total || 0;

  const refreshData = () => queryClient.invalidateQueries({ queryKey: ["tabungan"] });

  async function loadClassrooms() {
    try {
      const res = await fetch("/api/classrooms");
      const json = await res.json();
      if (json.success) setClassrooms(json.data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadClassrooms(); }, []);

  // === Setor / Tarik ===
  async function handleTransaction() {
    if (!selectedStudent || !txAmount || Number(txAmount) <= 0) { showToast("Jumlah harus lebih dari 0", "error"); return; }
    setTxLoading(true);
    try {
      const res = await fetch("/api/tabungan/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          type: txType,
          amount: Number(txAmount),
          date: txDate,
          description: txDesc,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowTransaction(false);
        setSelectedStudent(null);
        setTxAmount(""); setTxDesc("");
        refreshData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal memproses transaksi", "error"); }
    finally { setTxLoading(false); }
  }

  // === Riwayat Mutasi ===
  async function openHistory(student: any) {
    setHistoryStudent(student);
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/tabungan/${student.id}/history`);
      const json = await res.json();
      if (json.success) {
        setHistoryData(json.history || []);
        setHistoryBalance(json.balance || 0);
      }
    } catch { showToast("Gagal memuat riwayat", "error"); }
    finally { setHistoryLoading(false); }
  }

  function openTransaction(student: any, type: "setor" | "tarik") {
    setSelectedStudent(student);
    setTxType(type);
    setTxAmount("");
    setTxDesc("");
    setShowTransaction(true);
  }

  const totalSaldo = data.reduce((sum, s) => sum + (s.balance || 0), 0);
  const thStyle: React.CSSProperties = { padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: toast.type === "success" ? "#059669" : "#e11d48", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero Header */}
      <PageHeader
        title="Tabungan Siswa"
        subtitle="Kelola setoran & penarikan tabungan seluruh siswa aktif."
        icon={<Wallet />}
        actions={
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2">
              <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Total Saldo</p>
              <p className="font-heading text-lg font-extrabold text-white m-0 leading-tight">{fmtRp(totalSaldo)}</p>
            </div>
            <select
              value={classFilter}
              onChange={e => { setClassFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl text-sm font-medium cursor-pointer outline-none hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/30"
              style={{ paddingRight: "2rem" }}
            >
              <option value="" className="text-slate-800">Semua Kelas</option>
              {classrooms.map((c: any) => (
                <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Tabel Siswa & Saldo */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Daftar Siswa & Saldo</h4>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{total} Siswa</span>
        </div>
        {data.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100">
            <ExportButtons options={{
              title: "Tabungan Siswa",
              filename: `tabungan_siswa_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "Nama Siswa", key: "name", width: 30 },
                { header: "NISN", key: "nisn", width: 18 },
                { header: "Kelas", key: "classroom", width: 15, align: "center" },
                { header: "Saldo", key: "balance", width: 20, align: "right", format: (v: number) => fmtRupiah(v) },
              ],
              data: data.map((s: any, i: number) => ({
                ...s,
                _no: (page - 1) * limit + i + 1,
                nisn: s.nisn || '-',
                classroom: s.classroom || '-',
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Siswa</th>
                <th style={thStyle}>Kelas</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Saldo</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#8b5cf6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Data Siswa</p>
                  </div>
                </td></tr>
              ) : data.map((s: any, i: number) => {
                const initial = (s.name || "?").charAt(0).toUpperCase();
                const saldoColor = (s.balance || 0) > 0 ? "#059669" : "#94a3b8";

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#6366f1" }}>{initial}</div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{s.name}</p>
                          <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>NISN: {s.nisn || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}><span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{s.classroom || "-"}</span></td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: saldoColor }}>{fmtRp(s.balance || 0)}</span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                        <button onClick={() => openHistory(s)} style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}>Mutasi</button>
                        <button onClick={() => openTransaction(s, "setor")} style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "0.5rem", cursor: "pointer" }}>Setor</button>
                        <button onClick={() => openTransaction(s, "tarik")} style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Tarik</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      </Card>

      {/* Modal Setor/Tarik */}
      {showTransaction && selectedStudent && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowTransaction(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 440, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>
              {txType === "setor" ? "Setor" : "Tarik"} Tabungan
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>{selectedStudent.name} — Saldo: <strong>{fmtRp(selectedStudent.balance || 0)}</strong></p>

            <div style={{ marginTop: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Jumlah (Rp)</label>
              <input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="0" style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "1rem", fontWeight: 700, outline: "none" }} />
            </div>

            <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tanggal</label>
                <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Keterangan</label>
                <input type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Opsional..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowTransaction(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handleTransaction} disabled={txLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: txLoading ? "#94a3b8" : txType === "setor" ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#e11d48,#be123c)", border: "none", borderRadius: "0.625rem", cursor: txLoading ? "not-allowed" : "pointer" }}>
                {txLoading ? "Memproses..." : txType === "setor" ? "Setor Sekarang" : "Tarik Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat Mutasi */}
      {showHistory && historyStudent && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowHistory(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 560, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Riwayat Mutasi</h3>
              <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{historyStudent.name} — Saldo: <strong style={{ color: "#059669" }}>{fmtRp(historyBalance)}</strong></p>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "1rem 2rem" }}>
              {historyLoading ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem 0" }}>Memuat...</p>
              ) : historyData.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "2rem 0" }}>Belum ada transaksi.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {historyData.map((h: any) => (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: "0.625rem", background: h.type === "setor" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${h.type === "setor" ? "#bbf7d0" : "#fecaca"}` }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>
                          {h.type === "setor" ? "↓ Setoran" : "↑ Penarikan"}
                        </p>
                        <p style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "0.125rem" }}>{h.date} — {h.description || "-"}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.875rem", color: h.type === "setor" ? "#059669" : "#e11d48", margin: 0 }}>
                          {h.type === "setor" ? "+" : "-"}{fmtRp(h.amount)}
                        </p>
                        <p style={{ fontSize: "0.625rem", color: "#94a3b8", marginTop: "0.125rem" }}>Saldo: {fmtRp(h.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: "1rem 2rem", borderTop: "1px solid #e2e8f0" }}>
              <button onClick={() => setShowHistory(false)} style={{ width: "100%", padding: "0.625rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
