"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ExportButtons } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(10);

  const { data: result, isLoading } = useQuery({
    queryKey: ["subjects", page, search],
    queryFn: async () => {
      const res = await fetch(`/api/subjects?page=${page}&limit=${limit}&q=${search}`);
      return res.json();
    },
  });

  const data = result?.data || [];
  const paginationMeta = result?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["subjects"] });
  };

  const handleAdd = () => {
    Swal.fire({
      title: "Tambah Mata Pelajaran",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Mapel *</label>
          <input type="text" id="swal-subject-name" class="swal2-input" placeholder="Mis: Bahasa Indonesia" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Kode / Singkatan</label>
          <input type="text" id="swal-subject-code" class="swal2-input" placeholder="Mis: BIND" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Jenis *</label>
            <select id="swal-subject-type" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="wajib">Wajib</option>
              <option value="mulok">Muatan Lokal</option>
              <option value="muatan_khusus">Muatan Khusus / Peminatan</option>
            </select>
          </div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Tingkat Kelas</label>
          <input type="text" id="swal-subject-tingkat" class="swal2-input" placeholder="Mis: VII, VIII, IX" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const name = (document.getElementById("swal-subject-name") as HTMLInputElement).value;
        if (!name) {
          Swal.showValidationMessage('Nama Mepel wajib diisi');
          return false;
        }
        return {
          name,
          code: (document.getElementById("swal-subject-code") as HTMLInputElement).value,
          type: (document.getElementById("swal-subject-type") as HTMLSelectElement).value,
          tingkatKelas: (document.getElementById("swal-subject-tingkat") as HTMLInputElement).value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/subjects", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(r.value) 
          });
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Mata pelajaran ditambahkan", "success"); 
            refreshData(); 
          } else {
            Swal.fire("Gagal", json.message || json.error || "Gagal", "error");
          }
        } catch { 
          Swal.fire("Error", "Server error", "error"); 
        }
      }
    });
  };

  const handleEdit = (sub: any) => {
    Swal.fire({
      title: "Edit Mata Pelajaran",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Mapel *</label>
          <input type="text" id="swal-subject-name" class="swal2-input" value="${sub.name}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Kode / Singkatan</label>
          <input type="text" id="swal-subject-code" class="swal2-input" value="${sub.code || ''}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Jenis *</label>
            <select id="swal-subject-type" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="wajib" ${sub.type === 'wajib' ? 'selected' : ''}>Wajib</option>
              <option value="mulok" ${sub.type === 'mulok' ? 'selected' : ''}>Muatan Lokal</option>
              <option value="muatan_khusus" ${sub.type === 'muatan_khusus' ? 'selected' : ''}>Muatan Khusus / Peminatan</option>
            </select>
          </div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Tingkat Kelas</label>
          <input type="text" id="swal-subject-tingkat" class="swal2-input" value="${sub.tingkatKelas || ''}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const name = (document.getElementById("swal-subject-name") as HTMLInputElement).value;
        if (!name) {
          Swal.showValidationMessage('Nama Mapel wajib diisi');
          return false;
        }
        return {
          name,
          code: (document.getElementById("swal-subject-code") as HTMLInputElement).value,
          type: (document.getElementById("swal-subject-type") as HTMLSelectElement).value,
          tingkatKelas: (document.getElementById("swal-subject-tingkat") as HTMLInputElement).value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/subjects/${sub.id}`, { 
            method: "PUT", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(r.value) 
          });
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Mata pelajaran diperbarui", "success"); 
            refreshData(); 
          } else {
            Swal.fire("Gagal", json.message || json.error || "Gagal", "error");
          }
        } catch { 
          Swal.fire("Error", "Server error", "error"); 
        }
      }
    });
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Hapus Mata Pelajaran?",
      text: "Data yang dihapus (soft delete) tidak akan tampil di daftar aktif.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Dihapus", "success"); 
            refreshData(); 
          } else {
            Swal.fire("Gagal", json.message || json.error || "Gagal", "error");
          }
        } catch { 
          Swal.fire("Error", "Server error", "error"); 
        }
      }
    });
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Mata Pelajaran"
        subtitle="Kelola daftar mata pelajaran sekolah."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-2">
            <ExportButtons 
              options={{
                title: "Data Mata Pelajaran",
                filename: `data_mata_pelajaran_${new Date().toISOString().split("T")[0]}`,
                columns: [
                  { header: "No", key: "_no", width: 8, align: "center" },
                  { header: "Kode", key: "code", width: 15 },
                  { header: "Nama Mata Pelajaran", key: "name", width: 35 },
                  { header: "Jenis", key: "type", width: 20, format: (v: string) => v === "wajib" ? "Wajib" : v === "mulok" ? "Muatan Lokal" : "Muatan Khusus" },
                  { header: "Tingkat", key: "tingkatKelas", width: 20, format: (v: string) => v || "Semua" },
                ],
                data: data.map((d: any, i: number) => ({
                  ...d,
                  _no: ((paginationMeta.page - 1) * paginationMeta.limit) + i + 1,
                })),
              }}
            />
            <button 
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold border border-blue-400 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Mapel
            </button>
          </div>
        }
      />

      <Card noPadding>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h4 className="font-bold text-slate-800 text-sm">Daftar Mata Pelajaran</h4>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mapel..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left bg-white">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[50px]">No</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Kode</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Nama Mata Pelajaran</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Jenis</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Tingkat</th>
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    <span className="text-xs font-medium">Memuat data...</span>
                  </div>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    <span className="text-xs font-medium">{search ? "Hasil tidak ditemukan" : "Belum ada data mata pelajaran"}</span>
                  </div>
                </td></tr>
              ) : (
                data.map((item: any, index: number) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 border-dashed last:border-0">
                    <td className="py-2.5 px-4 text-center text-[13px] font-semibold text-slate-400">{((paginationMeta.page - 1) * paginationMeta.limit) + index + 1}</td>
                    <td className="py-2.5 px-4 text-[13px] text-slate-600">{item.code || '-'}</td>
                    <td className="py-2.5 px-4 text-[13px] font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-4 text-[13px]">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        item.type === 'wajib' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        item.type === 'mulok' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.type === 'wajib' ? 'Wajib' : item.type === 'mulok' ? 'Muatan Lokal' : 'Muatan Khusus'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[13px] text-slate-600">{item.tingkatKelas || 'Semua'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleEdit(item)} className="inline-flex py-1 px-2.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 hover:border-indigo-200 rounded text-center transition-colors">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="inline-flex py-1 px-2.5 text-[11px] font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 hover:border-rose-200 rounded text-center transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <Pagination
              page={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              total={paginationMeta.total}
              limit={paginationMeta.limit}
              onPageChange={(p: number) => setPage(p)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
