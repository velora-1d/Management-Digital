"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Gift } from "lucide-react";

export default function WakafPage() {
  const escapeHtml = (str: string) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const [activeTab, setActiveTab] = useState("riwayat"); // riwayat, donatur, tujuan
  const [data, setData] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [purposes, setPurposes] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ total: 0, monthly: 0, donorCount: 0, purposeCount: 0 });
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (activeTab === "riwayat") loadData();
    if (activeTab === "donatur" || activeTab === "riwayat") loadDonors();
    if (activeTab === "tujuan" || activeTab === "riwayat") loadPurposes();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/wakaf`);
      const json = await res.json();
      if (json.success) {
        setData(json.transactions || []);
        setKpi(json.kpi || { total: 0, monthly: 0, donorCount: 0, purposeCount: 0 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadDonors() {
    try {
      const res = await fetch(`/api/wakaf/donors`);
      const json = await res.json();
      if (json.success) setDonors(json.data || []);
    } catch (e) { console.error(e); }
  }

  async function loadPurposes() {
    try {
      const res = await fetch(`/api/wakaf/purposes`);
      const json = await res.json();
      if (json.success) setPurposes(json.data || []);
    } catch (e) { console.error(e); }
  }

  function fmtRp(n: number) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  // --- ACTIONS TRANSAKSI ---
  const handleAddWakaf = () => {
    let donorOptions = '<option value="">-- Pilih Donatur --</option>';
    donors.forEach(d => { donorOptions += `<option value="${d.id}">${d.name} (${d.phone || "-"})</option>`; });
    
    let purposeOptions = '<option value="">-- Pilih Tujuan --</option>';
    purposes.forEach(p => { purposeOptions += `<option value="${p.id}">${p.name}</option>`; });

    Swal.fire({
      title: "Terima Wakaf",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Tanggal</label>
            <input type="date" id="swal-w-date" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Donatur</label>
            <select id="swal-w-donor" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">${donorOptions}</select>
            <p style="font-size:0.7rem;color:#64748b;margin-top:0.25rem;">*Donatur baru? Tambah di tab Donatur dulu.</p>
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Tujuan Wakaf</label>
            <select id="swal-w-purpose" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">${purposeOptions}</select>
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Nominal (Rp)</label>
            <input type="number" id="swal-w-amount" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan Transaksi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        return {
          date: (document.getElementById("swal-w-date") as HTMLInputElement).value,
          donor_id: Number((document.getElementById("swal-w-donor") as HTMLSelectElement).value),
          purpose_id: Number((document.getElementById("swal-w-purpose") as HTMLSelectElement).value),
          amount: Number((document.getElementById("swal-w-amount") as HTMLInputElement).value)
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        const payload = r.value;
        if (!payload.donor_id || !payload.purpose_id || !payload.amount) {
          return Swal.fire("Error", "Semua kolom wajib diisi!", "error");
        }
        Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch("/api/wakaf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          Swal.close();
          if (res.ok && json.success) {
            Swal.fire("Berhasil", "Data wakaf disimpan", "success");
            loadData();
          } else Swal.fire("Gagal", json.error || "Gagal menyimpan", "error");
        } catch { Swal.fire("Error", "Terjadi kesalahan server", "error"); }
      }
    });
  };

  const handleDeleteWakaf = async (id: number) => {
    Swal.fire({
      title: "Void Transaksi?",
      text: "Transaksi ini akan divoid dan saldo kas akan dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Void"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/wakaf/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) {
            Swal.fire("Berhasil", "Transaksi di-void.", "success");
            loadData();
          } else Swal.fire("Gagal", json.error || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  // --- ACTIONS DONATUR ---
  const handleAddDonor = () => {
    Swal.fire({
      title: "Tambah Donatur",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Lengkap</label>
          <input type="text" id="swal-d-name" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">No HP</label>
          <input type="text" id="swal-d-phone" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Alamat</label>
          <textarea id="swal-d-address" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;"></textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => ({
        name: (document.getElementById("swal-d-name") as HTMLInputElement).value,
        phone: (document.getElementById("swal-d-phone") as HTMLInputElement).value,
        address: (document.getElementById("swal-d-address") as HTMLTextAreaElement).value
      })
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/wakaf/donors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Donatur ditambahkan", "success"); loadDonors(); }
          else Swal.fire("Gagal", json.error, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  // --- ACTIONS TUJUAN ---
  const handleAddPurpose = () => {
    Swal.fire({
      title: "Tambah Tujuan Wakaf",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Program/Tujuan</label>
          <input type="text" id="swal-p-name" class="swal2-input" placeholder="Misal: Pembangunan Masjid" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Deskripsi</label>
          <textarea id="swal-p-desc" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;"></textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => ({
        name: (document.getElementById("swal-p-name") as HTMLInputElement).value,
        description: (document.getElementById("swal-p-desc") as HTMLTextAreaElement).value
      })
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/wakaf/purposes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Tujuan ditambahkan", "success"); loadPurposes(); }
          else Swal.fire("Gagal", json.error, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleDeletePurpose = async (id: number) => {
    Swal.fire({
      title: "Hapus Tujuan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/wakaf/purposes?id=${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Dihapus", "success"); loadPurposes(); }
          else Swal.fire("Gagal", json.error, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <PageHeader
        title="Wakaf & Donasi"
        subtitle="Kelola penerimaan wakaf dan donatur madrasah."
        icon={<Gift />}
        gradient="from-emerald-600 via-teal-600 to-green-600"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Wakaf</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#059669", marginTop: "0.25rem" }}>{fmtRp(kpi.total)}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bulan Ini</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#0ea5e9", marginTop: "0.25rem" }}>{fmtRp(kpi.monthly)}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Donatur</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#6366f1", marginTop: "0.25rem" }}>{kpi.donorCount}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Program Tujuan</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#d97706", marginTop: "0.25rem" }}>{kpi.purposeCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab("riwayat")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "riwayat" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>Riwayat Wakaf</button>
        <button onClick={() => setActiveTab("donatur")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "donatur" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>Daftar Donatur</button>
        <button onClick={() => setActiveTab("tujuan")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "tujuan" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>Tujuan / Program</button>
      </div>

      {/* Panel Riwayat */}
      {activeTab === "riwayat" && (
        <Card className="animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Riwayat Penerimaan Wakaf</h4>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {data.length > 0 && (
                <ExportButtons options={{
                  title: "Riwayat Wakaf & Donasi",
                  filename: `wakaf_${new Date().toISOString().split("T")[0]}`,
                  columns: [
                    { header: "No", key: "_no", width: 8, align: "center" },
                    { header: "Tanggal", key: "_date", width: 15 },
                    { header: "Donatur", key: "donor_name", width: 25 },
                    { header: "Tujuan", key: "purpose_name", width: 25 },
                    { header: "Nominal", key: "amount", width: 20, align: "right", format: (v: number) => fmtRupiah(v) },
                    { header: "Status", key: "_status", width: 10, align: "center" },
                  ],
                  data: data.map((t: any, i: number) => ({
                    ...t,
                    _no: i + 1,
                    _date: new Date(t.date).toLocaleDateString("id-ID"),
                    _status: t.status === 'void' ? 'VOID' : 'VALID',
                  })),
                }} />
              )}
              <button onClick={handleAddWakaf} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 shadow-sm">+ Catat Wakaf</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 border-b border-slate-200">Tanggal</th>
                  <th className="px-6 py-3 border-b border-slate-200">Donatur</th>
                  <th className="px-6 py-3 border-b border-slate-200">Tujuan</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-right">Nominal</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-center">Status</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada transaksi</td></tr> : data.slice((page - 1) * limit, page * limit).map((t, i) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50" style={{ opacity: t.status === 'void' ? 0.5 : 1}}>
                    <td className="px-6 py-3 text-sm">{new Date(t.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-3 text-sm font-semibold">{t.donor_name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{t.purpose_name}</td>
                    <td className="px-6 py-3 text-sm font-bold text-emerald-600 text-right">{fmtRp(t.amount)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === 'void' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{t.status === 'void' ? 'VOID' : 'VALID'}</span>
                    </td>
                    <td className="px-6 py-3 text-center relative">
                      {t.status !== 'void' ? (
                        <>
                          <button 
                            onClick={(ev) => { 
                              ev.stopPropagation(); 
                              (ev.nativeEvent as any).stopImmediatePropagation();
                              setOpenActionId(openActionId === t.id ? null : t.id); 
                            }}
                            style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                            className="hover:bg-slate-100 transition-colors"
                          >
                            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {openActionId === t.id && (
                            <div 
                              style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem", textAlign: "left" }}>
                                Aksi Wakaf
                              </div>
                              <button onClick={() => { setOpenActionId(null); handleDeleteWakaf(t.id); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Void Transaksi
                              </button>
                            </div>
                          )}
                        </>
                      ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5">
            <Pagination page={page} totalPages={Math.ceil(data.length / limit) || 1} total={data.length} limit={limit} onPageChange={(p) => setPage(p)} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
          </div>
        </Card>
      )}

      {/* Panel Donatur */}
      {activeTab === "donatur" && (
        <Card className="animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Daftar Donatur Wakaf</h4>
            </div>
            <button onClick={handleAddDonor} className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-600 shadow-sm">+ Tambah Donatur</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 border-b border-slate-200">Nama Lengkap</th>
                  <th className="px-6 py-3 border-b border-slate-200">No HP</th>
                  <th className="px-6 py-3 border-b border-slate-200">Alamat</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada donatur</td></tr> : donors.map(d => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm font-semibold">{d.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{d.phone || "-"}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{d.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Panel Tujuan */}
      {activeTab === "tujuan" && (
        <Card className="animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Program / Tujuan Wakaf</h4>
            </div>
            <button onClick={handleAddPurpose} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 shadow-sm">+ Tambah Tujuan</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="px-6 py-3 border-b border-slate-200">Nama Program</th>
                  <th className="px-6 py-3 border-b border-slate-200">Deskripsi</th>
                  <th className="px-6 py-3 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {purposes.length === 0 ? <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada tujuan wakaf</td></tr> : purposes.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm font-semibold">{p.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{p.description || "-"}</td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => handleDeletePurpose(p.id)} className="w-7 h-7 inline-flex items-center justify-center rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}
