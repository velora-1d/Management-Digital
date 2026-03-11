"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import FilterBar from "@/components/FilterBar";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";

function StudentsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const query = searchParams.toString();
      const res = await fetch(`/api/students?${query}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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

  const handleDelete = (s: any) => {
    Swal.fire({
      title: "Hapus Siswa?",
      text: `Semua data terkait "${s.name}" akan ikut terhapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/students/${s.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            Swal.fire("Terhapus", "Data siswa berhasil dihapus.", "success");
            loadStudents();
          } else {
            Swal.fire("Gagal", json.message || "Error", "error");
          }
        } catch (error) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const catColors: Record<string, string[]> = {
    reguler: ["#f1f5f9", "#475569"],
    yatim: ["#fef3c7", "#92400e"],
    kurang_mampu: ["#ede9fe", "#6b21a8"],
  };

  const statusColors: Record<string, string[]> = {
    aktif: ["#d1fae5", "#047857"],
    lulus: ["#cffafe", "#0e7490"],
    pindah: ["#ffedd5", "#c2410c"],
    nonaktif: ["#e5e7eb", "#6b7280"],
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <FilterBar />

      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Manajemen Siswa</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Sesuai Tahun Ajaran & Kelas yang dipilih di Filter.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={() => window.location.href = "/api/students/template"} style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }} className="hover:bg-white/25 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Template
              </button>
              <label style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }} className="hover:bg-white/25 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Import
                <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  try {
                    const res = await fetch("/api/students/import", { method: "POST", body: fd });
                    const json = await res.json();
                    Swal.fire(json.success ? "Berhasil" : "Gagal", json.message, json.success ? "success" : "error");
                    if (json.success) loadStudents();
                  } catch { Swal.fire("Error", "Gagal import", "error"); }
                  e.target.value = "";
                }} />
              </label>
              <button onClick={() => window.location.href = `/api/students/export?${searchParams.toString()}`} style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.25)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export
              </button>
              <Link href="/students/new" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }} className="hover:bg-white/35 transition-all">
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Siswa */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "50%" }}></div>
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Siswa</h4>
        </div>
        {data.length > 0 && (
          <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <ExportButtons options={{
              title: "Data Siswa",
              filename: `data_siswa_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "Nama", key: "name", width: 35 },
                { header: "NISN", key: "nisn", width: 18 },
                { header: "Kelas", key: "classroom_name", width: 15, align: "center" },
                { header: "Kategori", key: "category", width: 15, align: "center" },
                { header: "Gender", key: "gender", width: 10, align: "center", format: (v: string) => v === 'L' ? 'Laki-laki' : 'Perempuan' },
                { header: "Status", key: "status", width: 12, align: "center", format: (v: string) => (v || 'aktif').charAt(0).toUpperCase() + (v || 'aktif').slice(1) },
              ],
              data: data.map((s: any, i: number) => ({
                ...s,
                _no: ((pagination.page - 1) * pagination.limit) + i + 1,
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Siswa</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kategorisasi</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kelas</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>
                  <svg className="animate-spin" style={{ width: 24, height: 24, margin: "0 auto 8px", display: "block" }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Memuat data...
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#8b5cf6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Data Siswa</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>Periksa filter Anda atau klik tombol "Tambah" untuk menambahkan data siswa.</p>
                  </div>
                </td></tr>
              ) : (
                data.map((s, i) => {
                  const idx = ((pagination.page - 1) * pagination.limit) + i + 1;
                  const genderLabel = s.gender === "L" ? "♂ Laki-laki" : "♀ Perempuan";
                  const cc = catColors[s.category] || catColors.reguler;
                  const sc = statusColors[s.status] || statusColors.nonaktif;
                  const catLabel = (s.category || "reguler").replace("_", " ").replace(/\b\w/g, (l:string) => l.toUpperCase());

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600, verticalAlign: "middle" }}>{idx}</td>
                      <td style={{ padding: "1rem 1.5rem", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#6366f1" }}>{(s.name || "?").charAt(0).toUpperCase()}</div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{s.name || "-"}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>NISN: {s.nisn || "-"} · {genderLabel}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, borderRadius: 999, background: cc[0], color: cc[1] }}>{catLabel}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        {(s.classroom && s.classroom.name) ? (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{s.classroom.name}</span>
                        ) : (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", padding: "0.25rem 0.625rem", borderRadius: 999 }}>Tanpa Kelas</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, borderRadius: 999, textTransform: "capitalize", background: sc[0], color: sc[1] }}>{s.status || "-"}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center", position: "relative" }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            (e.nativeEvent as any).stopImmediatePropagation();
                            setOpenActionId(openActionId === s.id ? null : s.id); 
                          }}
                          style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                          className="hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        >
                          <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {openActionId === s.id && (
                          <div 
                            style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem" }}>
                              Opsi Siswa
                            </div>
                            <Link 
                              href={`/students/${s.id}/edit`} 
                              style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#6366f1", textDecoration: "none", borderRadius: "0.5rem" }}
                              className="hover:bg-indigo-50"
                            >
                              Edit Data
                            </Link>
                            <button 
                              onClick={() => { setOpenActionId(null); handleDelete(s); }} 
                              style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#e11d48", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} 
                              className="hover:bg-rose-50"
                            >
                              Hapus Siswa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          page={pagination.page} 
          totalPages={pagination.totalPages} 
          total={pagination.total} 
          limit={pagination.limit} 
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            window.history.pushState({}, "", `?${params.toString()}`);
            loadStudents();
          }} 
          onLimitChange={(l) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("limit", String(l));
            params.set("page", "1");
            window.history.pushState({}, "", `?${params.toString()}`);
            loadStudents();
          }} 
        />
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div>Loading Students...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
