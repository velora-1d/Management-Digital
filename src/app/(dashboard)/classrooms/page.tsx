"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";

export default function ClassroomsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

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

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/classrooms`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function formatRp(n: number) {
    return Number(n).toLocaleString('id-ID');
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#d97706 0%,#f59e0b 50%,#fbbf24 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Ruang Kelas</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola rombongan belajar tingkat 1 sampai 6.</p>
              </div>
            </div>
            <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah Kelas
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Kelas */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#d97706,#f59e0b)", borderRadius: "50%" }}></div>
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Kelas</h4>
        </div>
        {data.length > 0 && (
          <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <ExportButtons options={{
              title: "Data Ruang Kelas",
              filename: `data_kelas_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "Tingkat", key: "level", width: 12, align: "center" },
                { header: "Nama Kelas", key: "name", width: 20 },
                { header: "Wali Kelas", key: "wali_kelas", width: 25 },
                { header: "Jumlah Siswa", key: "student_count", width: 15, align: "center" },
                { header: "Tarif Infaq", key: "infaq_nominal", width: 18, align: "right", format: (v: number) => fmtRupiah(v) },
              ],
              data: data.map((c: any, i: number) => ({
                ...c,
                _no: i + 1,
                wali_kelas: c.wali_kelas || 'Belum ada',
                student_count: c.student_count || 0,
                infaq_nominal: c.infaq_nominal || 0,
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tingkat</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama Kelas</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Wali Kelas</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Jumlah Siswa</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tarif Infaq</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>Memuat data kelas...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#d97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Data Kelas</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>Klik &quot;Tambah Kelas&quot; untuk menambahkan rombel baru.</p>
                  </div>
                </td></tr>
              ) : (
                data.map((c: any, i) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.125rem", color: "#b45309" }}>{c.level || "-"}</div>
                        <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b" }}>Tingkat {c.level || "-"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{c.name || "-"}</span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", color: c.wali_kelas ? "#1e293b" : "#94a3b8", fontWeight: c.wali_kelas ? 600 : 400 }}>
                      {c.wali_kelas || "Belum ada"}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#1e293b" }}>
                      {c.student_count || 0} <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 400 }}>siswa</span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#059669" }}>Rp {formatRp(c.infaq_nominal || 0)}</span>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center", position: "relative" }}>
                      <button 
                        onClick={(ev) => { 
                          ev.stopPropagation(); 
                          (ev.nativeEvent as any).stopImmediatePropagation();
                          setOpenActionId(openActionId === c.id ? null : c.id); 
                        }}
                        style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                        className="hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {openActionId === c.id && (
                        <div 
                          style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem" }}>
                            Aksi Kelas
                          </div>
                          <button onClick={async () => {
                            setOpenActionId(null);
                            const result = await Swal.fire({
                              title: "Edit Data Kelas",
                              html: `
                                <div style="text-align: left; margin-bottom: 10px;">
                                  <label style="font-size: 14px; font-weight: 600;">Nama Kelas</label>
                                  <input id="swal-input1" class="swal2-input" value="${c.name || ''}" style="margin-top: 5px;">
                                </div>
                                <div style="text-align: left;">
                                  <label style="font-size: 14px; font-weight: 600;">Tarif Infaq/SPP (Rp)</label>
                                  <input id="swal-input2" type="number" class="swal2-input" value="${c.infaq_nominal || c.infaqNominal || 0}" style="margin-top: 5px;">
                                </div>
                              `,
                              focusConfirm: false,
                              showCancelButton: true,
                              confirmButtonText: "Simpan",
                              cancelButtonText: "Batal",
                              preConfirm: () => {
                                const input1 = document.getElementById('swal-input1') as HTMLInputElement;
                                const input2 = document.getElementById('swal-input2') as HTMLInputElement;
                                return {
                                  newName: input1 ? input1.value : '',
                                  newInfaq: input2 ? input2.value : '0'
                                }
                              }
                            });

                            if (!result.isConfirmed) return;
                            
                            const { newName, newInfaq } = result.value || {};
                            if (!newName) {
                              Swal.fire("Error", "Nama kelas tidak boleh kosong", "error");
                              return;
                            }

                            try {
                              const res = await fetch(`/api/classrooms/${c.id}`, {
                                method: "PUT", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: newName, infaqNominal: Number(newInfaq) }),
                              });
                              const json = await res.json();
                              if (json.success) { showToast("Kelas berhasil diupdate"); loadData(); }
                              else showToast(json.message, "error");
                            } catch { showToast("Gagal update", "error"); }
                          }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-indigo-50">
                            Edit Data
                          </button>
                          <button onClick={async () => {
                            setOpenActionId(null);
                            const result = await Swal.fire({
                              title: "Hapus Kelas?",
                              text: `Hapus kelas ${c.name}?`,
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#e11d48",
                              cancelButtonColor: "#64748b",
                              confirmButtonText: "Ya, Hapus"
                            });
                            if (!result.isConfirmed) return;
                            try {
                              const res = await fetch(`/api/classrooms/${c.id}`, { method: "DELETE" });
                              const json = await res.json();
                              if (json.success) { showToast("Kelas berhasil dihapus"); loadData(); }
                              else showToast(json.message, "error");
                            } catch { showToast("Gagal hapus", "error"); }
                          }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#e11d48", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-rose-50">
                            Hapus Kelas
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
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "0.75rem 1.25rem", borderRadius: "0.75rem",
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", color: toast.type === "error" ? "#991b1b" : "#166534",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`, fontWeight: 600, fontSize: "0.8125rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 200,
        }}>{toast.msg}</div>
      )}
    </div>
  );
}
