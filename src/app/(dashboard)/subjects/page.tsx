"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

export default function SubjectsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/subjects`);
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
            loadData(); 
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
            loadData(); 
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
            loadData(); 
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#2563eb 50%,#3b82f6 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Mata Pelajaran</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola daftar mata pelajaran sekolah.</p>
              </div>
            </div>
            <button onClick={handleAdd} className="hover:bg-white/30" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s ease" }}>
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah Mapel
            </button>
            <button onClick={() => {
              if (data.length === 0) { Swal.fire("Info", "Tidak ada data untuk diekspor", "info"); return; }
              exportCSV(
                ["No", "Kode", "Nama Mapel", "Jenis", "Tingkat Kelas"],
                data.map((d, i) => [i+1, d.code || "-", d.name, d.type === "wajib" ? "Wajib" : d.type === "mulok" ? "Muatan Lokal" : "Muatan Khusus", d.tingkatKelas || "Semua"]),
                "data_mata_pelajaran"
              );
            }} className="hover:bg-white/30" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s ease" }}>
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h3 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Mata Pelajaran</h3>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-1">{data.length}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[50px]">No</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Kode</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Nama Mata Pelajaran</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Jenis</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Tingkat</th>
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-[13px] text-slate-400">Memuat data mata pelajaran...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-[13px] text-slate-400">Belum ada data mata pelajaran.</td></tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 border-dashed last:border-0">
                    <td className="py-2.5 px-4 text-center text-[13px] font-semibold text-slate-400">{index + 1}</td>
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
        </div>
      </div>
    </div>
  );
}
