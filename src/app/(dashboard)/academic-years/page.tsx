"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { ExportButtons } from "@/lib/export-utils";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);

  const { data: result, isLoading } = useQuery({
    queryKey: ["academic-years", page, search],
    queryFn: async () => {
      const res = await fetch(`/api/academic-years?page=${page}&limit=${limit}&q=${search}`);
      return res.json();
    },
  });

  const data = result?.data || [];
  const pagination = result?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const refreshData = () => queryClient.invalidateQueries({ queryKey: ["academic-years"] });

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Tahun Ajaran"
        subtitle="Kelola periode tahun ajaran untuk filter & pelaporan."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-2">
            <ExportButtons 
              options={{
                title: "Data Tahun Ajaran",
                filename: `data_tahun_ajaran_${new Date().toISOString().split("T")[0]}`,
                columns: [
                  { header: "No", key: "_no", width: 8, align: "center" },
                  { header: "Tahun", key: "name", width: 25 },
                  { header: "Semester", key: "semester", width: 15, format: (v: string) => (v || 'ganjil').charAt(0).toUpperCase() + (v || 'ganjil').slice(1) },
                  { header: "Status", key: "is_active", width: 12, align: "center", format: (v: boolean) => v ? 'Aktif' : 'Nonaktif' },
                ],
                data: data.map((y: any, i: number) => ({
                  ...y,
                  _no: (page - 1) * limit + i + 1,
                })),
              }}
            />
            <button 
              onClick={async () => {
                const result = await Swal.fire({
                  title: "Tambah Tahun Ajaran",
                  html: `
                    <div style="text-align: left; margin-bottom: 10px;">
                      <label style="font-size: 14px; font-weight: 600;">Tahun (Contoh: 2023/2024)</label>
                      <input id="swal-input1" class="swal2-input" placeholder="2023/2024" style="margin-top: 5px;">
                    </div>
                    <div style="text-align: left;">
                      <label style="font-size: 14px; font-weight: 600;">Semester</label>
                      <select id="swal-input2" class="swal2-input" style="margin-top: 5px; width: 100%;">
                        <option value="ganjil">Ganjil</option>
                        <option value="genap">Genap</option>
                      </select>
                    </div>
                  `,
                  focusConfirm: false,
                  showCancelButton: true,
                  confirmButtonText: "Simpan",
                  cancelButtonText: "Batal",
                  preConfirm: () => {
                    const input1 = document.getElementById('swal-input1') as HTMLInputElement;
                    const input2 = document.getElementById('swal-input2') as HTMLSelectElement;
                    return {
                      name: input1 ? input1.value : '',
                      semester: input2 ? input2.value : 'ganjil'
                    }
                  }
                });

                if (!result.isConfirmed) return;
                const { name, semester } = result.value || {};
                if (!name) {
                  Swal.fire("Error", "Tahun ajaran tidak boleh kosong", "error");
                  return;
                }

                try {
                  const res = await fetch("/api/academic-years", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, semester }),
                  });
                  const json = await res.json();
                  if (json.success) { 
                    Swal.fire("Berhasil", "Tahun ajaran berhasil ditambahkan", "success"); 
                    refreshData(); 
                  } else {
                    Swal.fire("Gagal", json.message, "error");
                  }
                } catch { 
                  Swal.fire("Error", "Gagal menghubungi server", "error"); 
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold border border-sky-400 shadow-lg shadow-sky-900/20 transition-all uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah
            </button>
          </div>
        }
      />

      <Card noPadding>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <h4 className="font-bold text-slate-800 text-sm">Daftar Tahun Ajaran</h4>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tahun..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tahun & Semester</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>Memuat data...</span>
                  </div>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>{search ? "Hasil Tidak Ditemukan" : "Belum Ada Data"}</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>{search ? "Coba kata kunci lain." : "Tambahkan tahun ajaran baru."}</p>
                  </div>
                </td></tr>
              ) : (
                data.map((y: any, i: number) => {
                  const statusBadge = y.is_active
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}><span style={{ width: 6, height: 6, background: "#059669", borderRadius: "50%" }} className="animate-pulse"></span>Aktif</span>
                    : <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", background: "#e5e7eb", borderRadius: 999 }}>Nonaktif</span>;

                  return (
                    <tr key={y.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg style={{ width: "1.125rem", height: "1.125rem", color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>{y.name || "-"}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>Semester {(y.semester || "ganjil").charAt(0).toUpperCase() + (y.semester || "ganjil").slice(1)}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button 
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: "Update Status?",
                                text: `Ubah status tahun ajaran ${y.name} menjadi ${y.is_active ? 'Nonaktif' : 'Aktif'}?`,
                                icon: "question",
                                showCancelButton: true,
                                confirmButtonText: "Ya, Ubah",
                              });
                              if (!result.isConfirmed) return;
                              try {
                                await fetch(`/api/academic-years/${y.id}`, {
                                  method: "PUT", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ is_active: !y.is_active }),
                                });
                                refreshData();
                              } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
                            }}
                            style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}
                          >
                            Set Aktif/Nonaktif
                          </button>
                          <button 
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: "Hapus Tahun Ajaran?",
                                text: `Hapus periode ${y.name}?`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#e11d48",
                                confirmButtonText: "Ya, Hapus"
                              });
                              if (!result.isConfirmed) return;
                              try {
                                const res = await fetch(`/api/academic-years/${y.id}`, { method: "DELETE" });
                                const json = await res.json();
                                if (json.success) refreshData();
                                else Swal.fire("Gagal", json.message, "error");
                              } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
                            }}
                            style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && data.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(p) => setPage(p)}
              limit={limit}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
