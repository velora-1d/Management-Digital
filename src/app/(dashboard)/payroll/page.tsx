"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("riwayat"); // riwayat, atur-gaji, komponen

  // States for Riwayat
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [genMonth, setGenMonth] = useState((new Date().getMonth() + 1).toString());
  const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
  
  // States for Atur Gaji
  const [employees, setEmployees] = useState<any[]>([]);
  
  // States for Komponen
  const [components, setComponents] = useState<any[]>([]);
  const [compName, setCompName] = useState("");
  const [compType, setCompType] = useState("earning");

  const [loading, setLoading] = useState(false);
  const [payPage, setPayPage] = useState(1);
  const [payLimit, setPayLimit] = useState(20);
  const [payTotalPages, setPayTotalPages] = useState(1);
  const [payTotal, setPayTotal] = useState(0);

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

  // --- Load Data ---
  useEffect(() => {
    if (activeTab === "riwayat") loadPayrolls();
    if (activeTab === "atur-gaji") loadEmployees();
    if (activeTab === "komponen") loadComponents();
  }, [activeTab]);

  // RIWAYAT
  const loadPayrolls = async (p = payPage) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll?page=${p}&limit=${payLimit}`);
      const json = await res.json();
      if (json.success) {
        setPayrolls(json.data || []);
        if (json.pagination) {
          setPayTotalPages(json.pagination.totalPages);
          setPayTotal(json.pagination.total);
        }
      } else {
        setPayrolls(json || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const generatePayroll = async () => {
    Swal.fire({
      title: "Generate Slip Gaji",
      text: `Terbitkan slip gaji bulan ${genMonth}-${genYear} untuk semua pegawai aktif?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Generate",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6"
    }).then(async (r) => {
      if (r.isConfirmed) {
        Swal.fire({title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading()});
        try {
          const res = await fetch("/api/payroll", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ month: genMonth, year: genYear })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire("Berhasil", data.message, "success");
            loadPayrolls();
          } else {
            Swal.fire("Gagal", data.error || "Terjadi kesalahan", "error");
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const deletePayroll = async (id: number) => {
    Swal.fire({
      title: "Hapus Slip Gaji?",
      text: "Slip ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/payroll/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire("Berhasil", "Slip dihapus.", "success");
            loadPayrolls();
          } else {
            Swal.fire("Gagal", data.error || "Error", "error");
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const printPayroll = async (id: number) => {
    Swal.fire({title: "Memuat slip...", allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
      const res = await fetch(`/api/payroll/${id}`);
      const slip = await res.json();
      Swal.close();
      if (slip.error) {
        Swal.fire("Error", slip.error, "error");
        return;
      }
      
      let earnRows = "";
      let dedRows = "";
      slip.components.forEach((c: any) => {
        if (c.type === "earning") earnRows += `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:13px;">${c.name}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-size:13px;">Rp ${c.amount.toLocaleString("id-ID")}</td></tr>`;
        else dedRows += `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:13px;">${c.name}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-size:13px;">Rp ${c.amount.toLocaleString("id-ID")}</td></tr>`;
      });
      
      let html = `<div style="text-align:left;font-size:13px;">
      <div style="text-align:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:16px;">SLIP GAJI</h3>
        <p style="margin:4px 0 0;color:#64748b;font-size:12px;">Kode: ${slip.code} | ${slip.employee_name}</p>
        <p style="margin:2px 0 0;color:#64748b;font-size:12px;">Bulan/Tahun: ${slip.month}/${slip.year}</p>
      </div>
      <p style="font-weight:700;margin:12px 0 4px;">Pendapatan</p>
      <table style="width:100%;border-collapse:collapse;">
        ${slip.base_salary > 0 ? `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:13px;">Gaji Pokok</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-size:13px;">Rp ${slip.base_salary.toLocaleString("id-ID")}</td></tr>` : ''}
        ${earnRows}
        <tr style="background:#f0fdf4;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:700;">Total Pendapatan</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#059669;">Rp ${slip.total_earning.toLocaleString("id-ID")}</td></tr>
      </table>
      <p style="font-weight:700;margin:12px 0 4px;">Potongan</p>
      <table style="width:100%;border-collapse:collapse;">
        ${dedRows}
        ${!dedRows ? `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:13px;color:#94a3b8;font-style:italic;" colspan="2">- Tidak ada potongan -</td></tr>` : ''}
        <tr style="background:#fef2f2;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:700;">Total Potongan</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#e11d48;">Rp ${slip.total_deduction.toLocaleString("id-ID")}</td></tr>
      </table>
      <div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;text-align:center;">
        <span style="font-weight:800;font-size:18px;color:#1e293b;">Gaji Bersih: Rp ${slip.net_salary.toLocaleString("id-ID")}</span>
      </div>
      </div>`;

      Swal.fire({
        title: "",
        html: html,
        width: 520,
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: "Cetak",
        confirmButtonColor: "#16a34a"
      }).then((r) => {
        if (r.isConfirmed) {
          const w = window.open("", "_blank", "width=600,height=700");
          if (w) {
            w.document.write(`<html><head><title>Slip Gaji</title><style>body{font-family:Arial,sans-serif;padding:24px;}table{width:100%;border-collapse:collapse;}td{padding:6px 12px;border:1px solid #ccc;font-size:13px;} @media print{button{display:none;}}</style></head><body>${html}<br><button onclick="window.print()" style="padding:8px 24px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">Print</button></body></html>`);
            w.document.close();
          }
        }
      });

    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  }

  // ATUR GAJI
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/employees");
      const data = await res.json();
      setEmployees(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const setupSalary = async (empId: number, empName: string) => {
    Swal.fire({title: "Memuat...", allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    try {
      const res = await fetch(`/api/payroll/employees/${empId}/salary`);
      const detail = await res.json();
      Swal.close();

      const comps = detail.components || [];
      let formHtml = '<div style="text-align:left;display:grid;gap:0.75rem;max-height:350px;overflow-y:auto;">';
      if (comps.length === 0) formHtml += '<p style="color:#94a3b8;font-size:0.8125rem;">Belum ada komponen gaji.</p>';
      
      comps.forEach((c: any, i: number) => {
        const color = c.type === 'earning' ? '#059669' : '#e11d48';
        const prefix = c.type === 'earning' ? '+' : '−';
        formHtml += `<div><label style="font-size:0.75rem;font-weight:600;color:${color};">${prefix} ${c.name}</label><input id="swal-sal-${i}" type="number" class="swal2-input" value="${c.amount || 0}" data-comp-id="${c.id}" style="margin:0; height: 2.5rem; padding: 0.5rem; display:block; width:100%; font-size: 0.875rem; border:1px solid #e2e8f0; border-radius:0.5rem; outline:none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'"></div>`;
      });
      formHtml += '</div>';

      Swal.fire({
        title: 'Atur Gaji: ' + empName,
        html: formHtml,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#3b82f6',
        preConfirm: () => {
          const result: any[] = [];
          comps.forEach((c: any, i: number) => {
            const el = document.getElementById('swal-sal-' + i) as HTMLInputElement;
            result.push({ component_id: c.id, amount: Number(el?.value) || 0 });
          });
          return result;
        }
      }).then(async (r) => {
        if (r.isConfirmed) {
          try {
            const saveRes = await fetch(`/api/payroll/employees/${empId}/salary`, {
              method: "PUT",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify(r.value)
            });
            const saveData = await saveRes.json();
            if (saveRes.ok && saveData.success) {
              Swal.fire("Berhasil", "Gaji diperbarui", "success");
            } else {
              Swal.fire("Gagal", saveData.error, "error");
            }
          } catch(e) {
            Swal.fire("Error", "Gagal menyimpan", "error");
          }
        }
      });
    } catch (e) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  }

  // KOMPONEN
  const loadComponents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/components");
      const data = await res.json();
      setComponents(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const addComponent = async () => {
    if (!compName) {
      Swal.fire("Error", "Nama komponen wajib diisi", "error");
      return;
    }
    try {
      const res = await fetch("/api/payroll/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: compName, type: compType })
      });
      if (res.ok) {
        setCompName("");
        loadComponents();
        Swal.fire("Berhasil", "Komponen ditambahkan", "success");
      } else {
        const data = await res.json();
        Swal.fire("Gagal", data.error, "error");
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menyimpan", "error");
    }
  };

  const deleteComponent = async (id: number) => {
    Swal.fire({
      title: "Hapus Komponen?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/payroll/components/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (res.ok && data.success) {
            Swal.fire("Berhasil", "Komponen dihapus", "success");
            loadComponents();
          } else {
            Swal.fire("Gagal", data.error, "error");
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#3b82f6 50%,#6366f1 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: 0 }}>Manajemen Penggajian</h2>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Kelola komponen, atur gaji, generate slip, dan pantau riwayat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab("riwayat")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "riwayat" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
          Generate & Riwayat
        </button>
        <button onClick={() => setActiveTab("atur-gaji")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "atur-gaji" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
          Atur Gaji Pegawai
        </button>
        <button onClick={() => setActiveTab("komponen")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "komponen" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
          Master Komponen
        </button>
      </div>

      {/* Panel: Riwayat */}
      {activeTab === "riwayat" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-500"></div>
              <h4 className="font-bold text-slate-800 text-sm">Terbitkan Slip Gaji Bulanan</h4>
            </div>
            <div className="p-6 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Bulan</label>
                <select value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 min-w-[150px] bg-white text-slate-700">
                  <option value="1">Januari</option><option value="2">Februari</option><option value="3">Maret</option>
                  <option value="4">April</option><option value="5">Mei</option><option value="6">Juni</option>
                  <option value="7">Juli</option><option value="8">Agustus</option><option value="9">September</option>
                  <option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Tahun</label>
                <input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)} className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 w-24 bg-white text-slate-700" />
              </div>
              <button onClick={generatePayroll} className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 rounded-xl shadow-sm hover:shadow transition-all">
                Generate Semua Slip
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">Log Histori Penggajian</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Kode / Tanggal</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Pegawai</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Gaji Bersih (THP)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-sm text-slate-500 border-b border-slate-100">Memuat...</td></tr>
                  ) : payrolls.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-500 text-sm border-b border-slate-100">Belum ada riwayat penggajian.</td></tr>
                  ) : (
                    payrolls.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <td className="px-6 py-3">
                          <p className="text-sm font-semibold text-slate-700">{p.code}</p>
                          <p className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString("id-ID")}</p>
                        </td>
                        <td className="px-6 py-3 font-semibold text-sm text-slate-800">{p.employee_name}</td>
                        <td className="px-6 py-3 font-bold text-sm text-slate-800">Rp {p.net_salary.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-3 text-right relative">
                          <button 
                            onClick={(ev) => { 
                              ev.stopPropagation(); 
                              (ev.nativeEvent as any).stopImmediatePropagation();
                              setOpenActionId(openActionId === p.id ? null : p.id); 
                            }}
                            style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                            className="hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          >
                            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {openActionId === p.id && (
                            <div 
                              style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem" }}>
                                Aksi Slip
                              </div>
                              <button onClick={() => { setOpenActionId(null); printPayroll(p.id); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Cetak Slip
                              </button>
                              <button onClick={() => { setOpenActionId(null); deletePayroll(p.id); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Hapus Slip
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={payPage} totalPages={payTotalPages} total={payTotal} limit={payLimit} onPageChange={(p) => { setPayPage(p); loadPayrolls(p); }} onLimitChange={(l) => { setPayLimit(l); setPayPage(1); loadPayrolls(1); }} />
          </div>
        </div>
      )}

      {/* Panel: Atur Gaji */}
      {activeTab === "atur-gaji" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm">Pengaturan Komponen Gaji per Pegawai</h4>
            <p className="text-xs text-slate-500 mt-1">Nominal yang diset di sini akan menjadi patokan saat Generate Slip Gaji.</p>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-center text-sm text-slate-500">Memuat data pegawai...</p>
            ) : employees.length === 0 ? (
              <p className="text-center text-sm text-slate-500">Belum ada data pegawai aktif.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map(e => (
                  <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">{e.name}</h5>
                      <p className="text-xs text-slate-500 capitalize">{e.type === 'guru' ? 'Guru' : 'Staff'} · {e.position || 'Tanpa Posisi'}</p>
                    </div>
                    <div className="relative flex justify-end">
                      <button 
                        onClick={(ev) => { 
                          ev.stopPropagation(); 
                          (ev.nativeEvent as any).stopImmediatePropagation();
                          setOpenActionId(openActionId === e.id ? null : e.id); 
                        }}
                        style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                        className="hover:bg-white transition-colors"
                      >
                        <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {openActionId === e.id && (
                        <div 
                          style={{ position: "absolute", bottom: "100%", right: 0, zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <button onClick={() => { setOpenActionId(null); setupSalary(e.id, e.name); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                            Atur Gaji
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel: Komponen */}
      {activeTab === "komponen" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in items-start">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-500"></div>
              <h4 className="font-bold text-slate-800 text-sm">Tambah Komponen</h4>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Nama Komponen</label>
                <input type="text" value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="Misal: Tunjangan Makan" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Jenis/Sifat</label>
                <select value={compType} onChange={(e) => setCompType(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white">
                  <option value="earning">Pendapatan (+)</option>
                  <option value="deduction">Potongan (-)</option>
                </select>
              </div>
              <button onClick={addComponent} className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 rounded-xl shadow-sm transition-all mt-2">
                Simpan Komponen
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">Daftar Master Komponen</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Nama Komponen</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Jenis</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="p-8 text-center text-sm text-slate-500 border-b border-slate-100">Memuat...</td></tr>
                  ) : components.length === 0 ? (
                    <tr><td colSpan={3} className="p-12 text-center text-slate-500 text-sm border-b border-slate-100">Belum ada komponen terdaftar.</td></tr>
                  ) : (
                    components.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-100">
                        <td className="px-6 py-4 font-semibold text-sm text-slate-800">{c.name}</td>
                        <td className="px-6 py-4">
                          {c.type === "earning" ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Pendapatan / Plus</span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-100">Potongan / Minus</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteComponent(c.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 inline-flex items-center justify-center hover:bg-red-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
