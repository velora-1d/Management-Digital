"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { ExportButtons, fmtRupiah as fmtRupiahExport } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { BookOpen } from "lucide-react";

// Fungsi format angka ke format rupiah (titik pemisah ribuan)
function formatRupiah(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi parse format rupiah kembali ke angka murni
function parseRupiah(value: string): number {
  return Number(value.replace(/\./g, "")) || 0;
}

export default function JournalPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Row Action Dropdown state
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside() {
      setOpenActionId(null);
    }
    if (openActionId !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);

  // Modal catat transaksi
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "in", amountDisplay: "", amount: 0, categoryId: "", date: new Date().toISOString().split("T")[0], description: "" });
  const [formLoading, setFormLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const loadData = useCallback(async (filter = typeFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?type=${filter}`);
      const json = await res.json();
      if (json.success) {
        setData(json.entries || []);
        setKpi(json.kpi || { totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
        if (json.categories) setCategories(json.categories);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => { loadData(); }, []);

  // Handler format Rp untuk input nominal
  const handleAmountChange = (val: string) => {
    const formatted = formatRupiah(val);
    setForm(f => ({ ...f, amountDisplay: formatted, amount: parseRupiah(formatted) }));
  };

  // === Catat Transaksi Baru ===
  async function handleCreate() {
    if (!form.amount || form.amount <= 0) { showToast("Jumlah harus lebih dari 0", "error"); return; }
    setFormLoading(true);
    try {
      const res = await fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: form.amount,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          date: form.date,
          description: form.description,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowCreate(false);
        setForm({ type: "in", amountDisplay: "", amount: 0, categoryId: "", date: new Date().toISOString().split("T")[0], description: "" });
        loadData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal mencatat transaksi", "error"); }
    finally { setFormLoading(false); }
  }

  // === Void Transaksi ===
  async function handleVoid(txId: number) {
    const result = await Swal.fire({
      title: "Void Transaksi?",
      text: "Yakin ingin VOID transaksi ini? Saldo kas akan dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Void"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/journal/${txId}/void`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal void transaksi", "error"); }
  }

  // === Edit Transaksi ===
  const handleEdit = (tx: any) => {
    let catOptions = '<option value="">-- Tanpa Kategori --</option>';
    categories.forEach(c => { catOptions += `<option value="${c.id}" ${tx.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`; });

    const formattedAmount = formatRupiah(String(Math.round(tx.amount)));

    Swal.fire({
      title: "Edit Transaksi Jurnal",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Jumlah</label>
          <div style="display:flex;align-items:center;gap:0;">
            <span style="display:inline-flex;align-items:center;padding:0 0.75rem;height:2.5rem;background:#f1f5f9;border:1.5px solid #e2e8f0;border-right:none;border-radius:0.625rem 0 0 0.625rem;font-size:0.875rem;font-weight:700;color:#6366f1;">Rp</span>
            <input type="text" id="swal-tx-amount" class="swal2-input" value="${formattedAmount}" style="margin:0;flex:1;height:2.5rem;padding:0.5rem;font-size:0.875rem;font-weight:700;border-radius:0 0.625rem 0.625rem 0;border-left:none;" oninput="this.value=this.value.replace(/\\D/g,'').replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.')">
          </div></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Tipe</label>
            <select id="swal-tx-type" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="in" ${tx.type === 'in' ? 'selected' : ''}>Pemasukan (In)</option>
              <option value="out" ${tx.type === 'out' ? 'selected' : ''}>Pengeluaran (Out)</option>
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Kategori</label>
            <select id="swal-tx-cat" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              ${catOptions}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Tanggal</label>
          <input type="date" id="swal-tx-date" class="swal2-input" value="${tx.date.split('T')[0]}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Keterangan</label>
          <input type="text" id="swal-tx-desc" class="swal2-input" value="${tx.description || ''}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const rawAmount = (document.getElementById("swal-tx-amount") as HTMLInputElement).value.replace(/\./g, "");
        return {
          amount: rawAmount,
          type: (document.getElementById("swal-tx-type") as HTMLSelectElement).value,
          categoryId: (document.getElementById("swal-tx-cat") as HTMLSelectElement).value,
          date: (document.getElementById("swal-tx-date") as HTMLInputElement).value,
          description: (document.getElementById("swal-tx-desc") as HTMLInputElement).value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/journal/${tx.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Transaksi diperbarui", "success"); loadData(); }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  // === Hapus Transaksi ===
  const handleDelete = async (txId: number) => {
    Swal.fire({
      title: "Hapus Transaksi?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/journal/${txId}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Transaksi Dihapus", "success"); loadData(); }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const thStyle: React.CSSProperties = { padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: toast.type === "success" ? "#059669" : "#e11d48", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero Header */}
      {/* Hero Header */}
      <PageHeader
        title="Jurnal Umum"
        subtitle="Kelola arus kas masuk dan keluar sekolah secara terpusat."
        icon={<BookOpen />}
        gradient="from-indigo-800 via-indigo-900 to-indigo-600"
        actions={
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center px-4 py-2 bg-white text-indigo-900 rounded-lg text-sm font-bold shadow hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Catat Jurnal Baru
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Saldo</p>
          <h3 className="font-heading text-2xl font-bold text-slate-800 m-0">{fmtRp(kpi.totalBalance)}</h3>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Pemasukan (Bulan Ini)</p>
          <h3 className="font-heading text-2xl font-bold text-emerald-700 m-0">{fmtRp(kpi.thisMonthIn)}</h3>
        </div>
        <div className="bg-rose-50 rounded-xl border border-rose-100 p-5 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest mb-1">Pengeluaran (Bulan Ini)</p>
          <h3 className="font-heading text-2xl font-bold text-rose-700 m-0">{fmtRp(kpi.thisMonthOut)}</h3>
        </div>
      </div>

      {/* Filter & Tabel */}
      <Card className="animate-fade-in">
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#0f172a", margin: 0 }}>Riwayat Jurnal</h3>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); loadData(e.target.value); }} style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", color: "#475569", background: "#fff", outline: "none" }}>
            <option value="">Semua Tipe</option>
            <option value="in">Pemasukan (In)</option>
            <option value="out">Pengeluaran (Out)</option>
          </select>
        </div>
        {data.length > 0 && (
          <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <ExportButtons options={{
              title: "Jurnal Umum",
              filename: `jurnal_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "Tanggal", key: "_date", width: 15 },
                { header: "Keterangan", key: "description", width: 30 },
                { header: "Kategori", key: "category_name", width: 20 },
                { header: "Tipe", key: "_type", width: 12, align: "center" },
                { header: "Jumlah", key: "amount", width: 20, align: "right", format: (v: number) => fmtRupiahExport(v) },
                { header: "Status", key: "_status", width: 10, align: "center" },
              ],
              data: data.map((e: any, i: number) => ({
                ...e,
                _no: i + 1,
                _date: e.date ? new Date(e.date).toLocaleDateString("id-ID") : '-',
                _type: e.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
                _status: e.status === 'void' ? 'VOID' : 'Aktif',
                description: e.description || '-',
                category_name: e.category_name || '-',
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ ...thStyle, width: 50, textAlign: "center" }}>No</th>
                <th style={{ ...thStyle, width: 120 }}>Tgl</th>
                <th style={thStyle}>Keterangan & Kategori</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Penerimaan</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Pengeluaran</th>
                <th style={{ ...thStyle, textAlign: "center", width: 160 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 48, height: 48, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg style={{ width: 24, height: 24, color: "#cbd5e1" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500, margin: 0 }}>Belum ada riwayat jurnal.</p>
                  </div>
                </td></tr>
              ) : data.slice((page - 1) * limit, page * limit).map((entry: any, i: number) => {
                const date = entry.date ? new Date(entry.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                const isIn = entry.type === "in";
                const isVoid = entry.status === "void";

                return (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: isVoid ? 0.4 : 1 }}>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#475569" }}>{date}</td>
                    <td style={{ padding: "0.875rem 1.5rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>
                        {entry.description || "-"}
                        {isVoid && <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, marginLeft: 6 }}>[VOID]</span>}
                      </p>
                      <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>{entry.category_name}</span>
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontWeight: 700, color: isIn ? "#059669" : "#cbd5e1", fontSize: "0.8125rem" }}>
                      {isIn ? fmtRp(entry.amount) : "-"}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontWeight: 700, color: !isIn ? "#e11d48" : "#cbd5e1", fontSize: "0.8125rem" }}>
                      {!isIn ? fmtRp(entry.amount) : "-"}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", position: "relative" }}>
                      {!isVoid ? (
                        <>
                          <button 
                            onClick={(ev) => { 
                              ev.stopPropagation(); 
                              (ev.nativeEvent as any).stopImmediatePropagation();
                              setOpenActionId(openActionId === entry.id ? null : entry.id); 
                            }}
                            style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                            className="hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          >
                            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {openActionId === entry.id && (
                            <div 
                              style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem" }}>
                                Aksi Jurnal
                              </div>
                              <button onClick={() => { setOpenActionId(null); handleEdit(entry); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-indigo-50">
                                Edit Transaksi
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleVoid(entry.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#d97706", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-amber-50">
                                Void (Batal)
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleDelete(entry.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#e11d48", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-rose-50">
                                Hapus Jurnal
                              </button>
                            </div>
                          )}
                        </>
                      ) : <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-5 border-t border-slate-100">
          <Pagination page={page} totalPages={Math.ceil(data.length / limit) || 1} total={data.length} limit={limit} onPageChange={(p) => setPage(p)} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
        </div>
      </Card>

      {/* Modal Catat Transaksi */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowCreate(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 480, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Catat Transaksi Baru</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>Isi data transaksi pemasukan atau pengeluaran.</p>

            {/* Tipe Toggle */}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setForm(f => ({ ...f, type: "in" }))} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, border: form.type === "in" ? "2px solid #059669" : "1.5px solid #e2e8f0", background: form.type === "in" ? "#ecfdf5" : "#fff", color: form.type === "in" ? "#059669" : "#64748b", cursor: "pointer" }}>
                ↓ Pemasukan
              </button>
              <button onClick={() => setForm(f => ({ ...f, type: "out" }))} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, border: form.type === "out" ? "2px solid #e11d48" : "1.5px solid #e2e8f0", background: form.type === "out" ? "#fff1f2" : "#fff", color: form.type === "out" ? "#e11d48" : "#64748b", cursor: "pointer" }}>
                ↑ Pengeluaran
              </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Jumlah *</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0 0.75rem", height: "2.75rem", background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRight: "none", borderRadius: "0.625rem 0 0 0.625rem", fontSize: "0.875rem", fontWeight: 700, color: "#6366f1" }}>Rp</span>
                <input type="text" value={form.amountDisplay} onChange={e => handleAmountChange(e.target.value)} placeholder="0" style={{ flex: 1, padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderLeft: "none", borderRadius: "0 0.625rem 0.625rem 0", fontSize: "1rem", fontWeight: 700, outline: "none", height: "2.75rem", boxSizing: "border-box" }} />
              </div>
              {form.amount > 0 && <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.25rem" }}>= {fmtRp(form.amount)}</p>}
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Kategori</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">— Tanpa Kategori —</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tanggal</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Keterangan</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Catatan..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handleCreate} disabled={formLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: formLoading ? "#94a3b8" : form.type === "in" ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#e11d48,#be123c)", border: "none", borderRadius: "0.625rem", cursor: formLoading ? "not-allowed" : "pointer" }}>
                {formLoading ? "Memproses..." : form.type === "in" ? "Catat Pemasukan" : "Catat Pengeluaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
