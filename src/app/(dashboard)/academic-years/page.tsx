"use client";
import { useState } from "react";
import LeftDrawer from "@/components/ui/LeftDrawer";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { ExportButtons } from "@/lib/export-utils";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, Trash2 } from "lucide-react";

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

interface ApiResponse {
  success: boolean;
  data: AcademicYear[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AcademicYearsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState({ year: "", isActive: false });

  const { data: result, isLoading } = useQuery<ApiResponse>({
    queryKey: ["academic-years", page, search],
    queryFn: async () => {
      const res = await fetch(`/api/academic-years?page=${page}&limit=${limit}&q=${search}`);
      return res.json();
    },
  });

  const data = result?.data || [];
  const pagination = result?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const refreshData = () => queryClient.invalidateQueries({ queryKey: ["academic-years"] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year.trim()) {
      Swal.fire("Error", "Tahun ajaran tidak boleh kosong", "error");
      return;
    }

    try {
      const url = editingYear ? `/api/academic-years/${editingYear.id}` : "/api/academic-years";
      const method = editingYear ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: formData.year.trim(),
          isActive: formData.isActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghubungi server");
      }
      const json = await res.json();
      if (json.success) {
        setIsDrawerOpen(false);
        setEditingYear(null);
        setFormData({ year: "", isActive: false });
        Swal.fire(
          "Berhasil",
          editingYear ? "Tahun ajaran berhasil diperbarui" : "Tahun ajaran berhasil ditambahkan",
          "success"
        );
        refreshData();
      } else {
        Swal.fire("Gagal", json.message || "Gagal menyimpan", "error");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Tahun Ajaran Terpilih?",
      text: `Anda akan menghapus ${selectedIds.length} tahun ajaran terpilih.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/academic-years/${id}`, { method: "DELETE" })));
      Swal.fire("Berhasil", `${selectedIds.length} tahun ajaran berhasil dihapus`, "success");
      setSelectedIds([]);
      refreshData();
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa tahun ajaran", "error");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Tahun Ajaran"
        subtitle="Kelola periode tahun ajaran untuk filter & pelaporan."
        icon={
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  { header: "Tahun", key: "year", width: 25 },
                  { header: "Status", key: "isActive", width: 12, align: "center", format: (v: boolean) => v ? 'Aktif' : 'Nonaktif' },
                ],
                data: data.map((y: AcademicYear, i: number) => ({
                  ...y,
                  _no: (page - 1) * limit + i + 1,
                })),
              }}
            />
            <button 
              onClick={() => {
                setEditingYear(null);
                setFormData({ year: "", isActive: false });
                setIsDrawerOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs uppercase tracking-wider cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah
            </button>
          </div>
        }
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in mb-4">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{selectedIds.length} tahun ajaran dipilih</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBulkDelete}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

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
                <th style={{ padding: "0.875rem 0.5rem", textAlign: "center", borderBottom: "1.5px solid #e2e8f0", width: 44 }}>
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? data.map(y => y.id) : [])}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label="Pilih semua tahun ajaran"
                  />
                </th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tahun</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>Memuat data...</span>
                  </div>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>{search ? "Hasil Tidak Ditemukan" : "Belum Ada Data"}</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>{search ? "Coba kata kunci lain." : "Tambahkan tahun ajaran baru."}</p>
                  </div>
                </td></tr>
              ) : (
                data.map((y: AcademicYear, i: number) => {
                  const isSelected = selectedIds.includes(y.id);
                  const statusBadge = y.isActive
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}><span style={{ width: 6, height: 6, background: "#059669", borderRadius: "50%" }} className="animate-pulse"></span>Aktif</span>
                    : <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", background: "#e5e7eb", borderRadius: 999 }}>Nonaktif</span>;

                  return (
                    <tr key={y.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 0.5rem", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, y.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== y.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih tahun ajaran ${y.year}`}
                        />
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>{(page - 1) * limit + i + 1}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg style={{ width: "1.125rem", height: "1.125rem", color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>{y.year || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button 
                            onClick={() => {
                              setEditingYear(y);
                              setFormData({ year: y.year || "", isActive: Boolean(y.isActive) });
                              setIsDrawerOpen(true);
                            }}
                            style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#0284c7", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "0.5rem", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: "Update Status?",
                                text: `Ubah status tahun ajaran ${y.year} menjadi ${y.isActive ? 'Nonaktif' : 'Aktif'}?`,
                                icon: "question",
                                showCancelButton: true,
                                confirmButtonText: "Ya, Ubah",
                              });
                              if (!result.isConfirmed) return;
                              try {
                                const res = await fetch(`/api/academic-years/${y.id}`, {
                                  method: "PUT", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isActive: !y.isActive }),
                                });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  throw new Error(err.message || "Gagal menghubungi server");
                                }
                                const json = await res.json();
                                if (json.success) {
                                  Swal.fire("Berhasil", "Status tahun ajaran berhasi diperbarui", "success");
                                  refreshData();
                                } else {
                                  Swal.fire("Gagal", json.message || "Gagal memperbarui status", "error");
                                }
                              } catch (error: unknown) { 
                                const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
                                Swal.fire("Error", msg, "error"); 
                              }
                            }}
                            style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem", cursor: "pointer" }}
                          >
                            Set Aktif/Nonaktif
                          </button>
                          <button 
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: "Hapus Tahun Ajaran?",
                                text: `Hapus periode ${y.year}?`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#e11d48",
                                confirmButtonText: "Ya, Hapus"
                              });
                              if (!result.isConfirmed) return;
                              try {
                                const res = await fetch(`/api/academic-years/${y.id}`, { method: "DELETE" });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  throw new Error(err.message || "Gagal menghubungi server");
                                }
                                const json = await res.json();
                                if (json.success) {
                                  Swal.fire("Berhasil", "Tahun ajaran berhasil dihapus", "success");
                                  refreshData();
                                } else {
                                  Swal.fire("Gagal", json.message || "Gagal menghapus tahun ajaran", "error");
                                }
                              } catch (error: unknown) { 
                                const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
                                Swal.fire("Error", msg, "error"); 
                              }
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

      {/* LeftDrawer Form Tambah & Edit Tahun Ajaran */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingYear(null);
        }}
        title={editingYear ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
        subtitle="Kelola konfigurasi periode tahun ajaran aktif sistem"
        width="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Contoh: 2024/2025"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Format umum: YYYY/YYYY (misal: 2024/2025)
            </span>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Jadikan Tahun Ajaran Aktif</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setEditingYear(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingYear ? "Simpan Perubahan" : "Simpan Tahun Ajaran"}
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
