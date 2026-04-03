"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";

export default function ClassroomsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);
  const [openActionId, setOpenActionId] = useState<number | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ["classrooms", page, search],
    queryFn: async () => {
      const res = await fetch(`/api/classrooms?page=${page}&limit=${limit}&q=${search}`);
      return res.json();
    },
  });

  const data = result?.data || [];
  const pagination = result?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["classrooms"] });
  };

  useEffect(() => {
    function handleClickOutside() {
      setOpenActionId(null);
    }
    if (openActionId !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);


  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Ruang Kelas"
        subtitle="Kelola rombongan belajar tingkat 1 sampai 6."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-2">
            {data.length > 0 && (
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
                  _no: (page - 1) * limit + i + 1,
                  wali_kelas: c.waliKelas || 'Belum ada',
                  student_count: c.student_count || 0,
                  infaq_nominal: c.infaq_nominal || c.infaqNominal || 0,
                })),
              }} />
            )}
            <button 
              onClick={async () => {
                const result = await Swal.fire({
                  title: "Tambah Kelas Baru",
                  html: `
                    <div style="text-align: left; margin-bottom: 10px;">
                      <label style="font-size: 14px; font-weight: 600;">Nama Kelas</label>
                      <input id="swal-input1" class="swal2-input" placeholder="Contoh: 1-A" style="margin-top: 5px;">
                    </div>
                    <div style="text-align: left; margin-bottom: 10px;">
                      <label style="font-size: 14px; font-weight: 600;">Tingkat</label>
                      <select id="swal-input2" class="swal2-input" style="margin-top: 5px; width: 100%;">
                        <option value="1">Tingkat 1</option>
                        <option value="2">Tingkat 2</option>
                        <option value="3">Tingkat 3</option>
                        <option value="4">Tingkat 4</option>
                        <option value="5">Tingkat 5</option>
                        <option value="6">Tingkat 6</option>
                      </select>
                    </div>
                    <div style="text-align: left;">
                      <label style="font-size: 14px; font-weight: 600;">Tarif Infaq (Rp)</label>
                      <input id="swal-input3" type="number" class="swal2-input" placeholder="0" style="margin-top: 5px;">
                    </div>
                  `,
                  focusConfirm: false,
                  showCancelButton: true,
                  confirmButtonText: "Simpan",
                  cancelButtonText: "Batal",
                  preConfirm: () => {
                    const input1 = document.getElementById('swal-input1') as HTMLInputElement;
                    const input2 = document.getElementById('swal-input2') as HTMLSelectElement;
                    const input3 = document.getElementById('swal-input3') as HTMLInputElement;
                    return {
                      name: input1 ? input1.value : '',
                      level: input2 ? input2.value : '1',
                      infaq: input3 ? input3.value : '0'
                    }
                  }
                });

                if (!result.isConfirmed) return;
                const { name, level, infaq } = result.value || {};
                if (!name) {
                  Swal.fire("Error", "Nama kelas tidak boleh kosong", "error");
                  return;
                }

                try {
                  const res = await fetch("/api/classrooms", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, level: Number(level), infaqNominal: Number(infaq) }),
                  });
                  const json = await res.json();
                  if (json.success) { 
                    Swal.fire("Berhasil", "Kelas berhasil ditambahkan", "success"); 
                    refreshData(); 
                  } else {
                    Swal.fire("Gagal", json.message, "error");
                  }
                } catch { 
                  Swal.fire("Error", "Gagal menghubungi server", "error"); 
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-indigo-950 rounded-lg text-xs font-bold border border-amber-400 shadow-lg shadow-amber-900/20 transition-all uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kelas
            </button>
          </div>
        }
      />

      <Card noPadding>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500"></div>
            <h4 className="font-bold text-slate-800 text-sm">Daftar Ruang Kelas</h4>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kelas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left bg-white whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                <th className="py-3 px-6 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[50px]">No</th>
                <th className="py-3 px-6 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Tingkat</th>
                <th className="py-3 px-6 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Nama Kelas</th>
                <th className="py-3 px-6 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Wali Kelas</th>
                <th className="py-3 px-6 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Jumlah Siswa</th>
                <th className="py-3 px-6 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Tarif Infaq</th>
                <th className="py-3 px-6 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[80px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span>Memuat data kelas...</span>
                  </div>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#d97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>{search ? "Hasil Tidak Ditemukan" : "Belum Ada Data Kelas"}</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>{search ? "Coba kata kunci lain." : "Klik \"Tambah Kelas\" untuk menambahkan rombel baru."}</p>
                  </div>
                </td></tr>
              ) : (
                data.map((c: any, i: number) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                    <td className="py-4 px-6 text-center text-xs text-slate-500 font-medium">{(page - 1) * limit + i + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-100/50 rounded-lg flex items-center justify-center font-bold text-sm text-amber-600 shadow-sm">{c.level || "-"}</div>
                        <span className="font-semibold text-slate-700 text-sm">Tingkat {c.level || "-"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">{c.name || "-"}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                      {c.waliKelas || <span className="text-slate-400 italic font-normal text-xs">Belum ada</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-800">{c.student_count || 0}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Siswa</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-bold text-emerald-600 tabular-nums">{fmtRupiah(c.infaq_nominal || c.infaqNominal || 0)}</span>
                    </td>
                    <td className="py-4 px-6 text-center relative">
                      <button 
                        onClick={(ev) => { 
                          ev.stopPropagation(); 
                          (ev.nativeEvent as any).stopImmediatePropagation();
                          setOpenActionId(openActionId === c.id ? null : c.id); 
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                  <input id="swal-input1" class="swal2-input" style="margin-top: 5px;">
                                </div>
                                <div style="text-align: left;">
                                  <label style="font-size: 14px; font-weight: 600;">Tarif Infaq/SPP (Rp)</label>
                                  <input id="swal-input2" type="number" class="swal2-input" style="margin-top: 5px;">
                                </div>
                              `,
                              didOpen: () => {
                                const input1 = document.getElementById("swal-input1");
                                const input2 = document.getElementById("swal-input2");
                                if (input1) input1.value = c.name || '';
                                if (input2) input2.value = c.infaq_nominal || c.infaqNominal || 0;
                              },
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
                              if (json.success) { 
                                Swal.fire("Berhasil", "Kelas berhasil diupdate", "success"); 
                                refreshData(); 
                              } else {
                                Swal.fire("Gagal", json.message, "error");
                              }
                            } catch { 
                              Swal.fire("Error", "Gagal update", "error"); 
                            }
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
                              if (json.success) { 
                                Swal.fire("Berhasil", "Kelas berhasil dihapus", "success"); 
                                refreshData(); 
                              } else {
                                Swal.fire("Gagal", json.message, "error");
                              }
                            } catch { 
                              Swal.fire("Error", "Gagal hapus", "error"); 
                            }
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
