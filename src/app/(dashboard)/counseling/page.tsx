"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import { ExportButtons } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { 
  Plus, 
  Download, 
  MessageSquare, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  User, 
  Calendar as CalendarIcon, 
  FileText, 
  CornerDownRight,
  ChevronDown
} from "lucide-react";

interface Student { id: number; name: string; nisn: string; classroom?: { name: string }; }
interface Employee { id: number; name: string; }
interface CounselingRecord {
  id: number; studentId: number; counselorId: number | null;
  date: string; category: string; status: string; description: string; followUp: string;
  student: Student; counselor: Employee | null;
}

const categories = ["akademik", "perilaku", "sosial", "keluarga"];
const statuses = ["aktif", "proses", "selesai"];
const categoryColors: Record<string, string> = { 
  akademik: "bg-blue-50 text-blue-600 border-blue-100", 
  perilaku: "bg-amber-50 text-amber-600 border-amber-100", 
  sosial: "bg-emerald-50 text-emerald-600 border-emerald-100", 
  keluarga: "bg-purple-50 text-purple-600 border-purple-100" 
};
const statusColors: Record<string, string> = { 
  aktif: "bg-rose-50 text-rose-600 border-rose-100", 
  proses: "bg-amber-50 text-amber-600 border-amber-100", 
  selesai: "bg-emerald-50 text-emerald-600 border-emerald-100" 
};

export default function CounselingPage() {
  const [data, setData] = useState<CounselingRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CounselingRecord | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ studentId: "", counselorId: "", date: new Date().toISOString().split("T")[0], category: "akademik", description: "", followUp: "", status: "aktif" });
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/counseling?page=${page}&limit=${paginationMeta.limit}&`;
      if (filterCategory) url += `category=${filterCategory}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.pagination) {
          setPaginationMeta(json.pagination);
        }
      } else if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterCategory, filterStatus, paginationMeta.limit]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch("/api/students").then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
    fetch("/api/teachers").then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d.filter((t: { status?: string }) => !t.status || t.status === "aktif") : []));
  }, []);

  const handleSubmit = async () => {
    if (!form.studentId || !form.category) { Swal.fire("Error", "Siswa dan kategori wajib", "error"); return; }
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `/api/counseling/${editItem.id}` : "/api/counseling";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setEditItem(null);
    setForm({ studentId: "", counselorId: "", date: new Date().toISOString().split("T")[0], category: "akademik", description: "", followUp: "", status: "aktif" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Catatan BK diperbarui" : "Catatan BK ditambahkan", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ 
      title: "Hapus catatan BK?", 
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444" 
    });
    if (!r.isConfirmed) return;
    await fetch(`/api/counseling/${id}`, { method: "DELETE" });
    fetchData();
    Swal.fire("Berhasil", "Catatan telah dihapus", "success");
  };

  const handleEdit = (item: CounselingRecord) => {
    setEditItem(item);
    setForm({ studentId: item.studentId.toString(), counselorId: item.counselorId?.toString() || "", date: item.date, category: item.category, description: item.description, followUp: item.followUp, status: item.status });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bimbingan Konseling" 
        subtitle="Catatan bimbingan dan konseling siswa"
        icon={<MessageSquare />}
        actions={
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditItem(null); setForm({ studentId: "", counselorId: "", date: new Date().toISOString().split("T")[0], category: "akademik", description: "", followUp: "", status: "aktif" }); setShowModal(true); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Catatan
            </button>
            <ExportButtons 
              options={{
                title: "Laporan Bimbingan Konseling",
                subtitle: `Filter - Kategori: ${filterCategory || 'Semua'} | Status: ${filterStatus || 'Semua'}`,
                filename: `catatan_bk_${new Date().toISOString().split("T")[0]}`,
                columns: [
                  { header: "No", key: "_no", width: 10, align: "center" },
                  { header: "Tanggal", key: "date", width: 25 },
                  { header: "Siswa", key: "student_name", width: 40 },
                  { header: "Kategori", key: "category", width: 25, align: "center", format: (v: string) => v.toUpperCase() },
                  { header: "Status", key: "status", width: 25, align: "center", format: (v: string) => v.toUpperCase() },
                  { header: "Deskripsi", key: "description", width: 60 },
                  { header: "Tindak Lanjut", key: "followUp", width: 40 },
                ],
                data: data.map((d, i) => ({
                  ...d,
                  _no: ((paginationMeta.page - 1) * paginationMeta.limit) + i + 1,
                  student_name: d.student?.name || "-"
                }))
              }}
            />
          </div>
        }
      />

      {/* Filters */}
      <Card compact>
        <div className="flex flex-wrap items-end gap-6">
           <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Cari Siswa</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Masukkan nama siswa..."
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Kategori</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)} 
                className="bg-slate-50 border-none rounded-xl py-2 pl-9 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
            <div className="relative">
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                className="bg-slate-50 border-none rounded-xl py-2 px-4 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">Semua Status</option>
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </Card>
      ) : data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Belum ada catatan bimbingan konseling</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {data.map(item => (
            <div key={item.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all p-5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{item.student?.name || "—"}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryColors[item.category]}`}>
                          {item.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                       <User className="w-3.5 h-3.5 text-slate-400" />
                       <span className="font-medium text-slate-600">Konselor:</span> {item.counselor?.name || "—"}
                    </div>
                    <div className="flex items-center gap-2">
                       <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                       <span className="font-medium text-slate-600">Tanggal:</span> {item.date}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-200"></div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{item.description || "Tidak ada deskripsi"}</p>
                    </div>
                  </div>

                  {item.followUp && (
                    <div className="flex items-start gap-3 pl-2">
                      <CornerDownRight className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tindak Lanjut</p>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{item.followUp}"</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6 px-2">
                  <button 
                    onClick={() => handleEdit(item)} 
                    className="flex-1 md:w-10 md:h-10 flex items-center justify-center gap-2 md:gap-0 px-4 md:px-0 py-2 md:py-0 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all font-bold text-xs"
                    title="Edit Catatan"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="md:hidden">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="flex-1 md:w-10 md:h-10 flex items-center justify-center gap-2 md:gap-0 px-4 md:px-0 py-2 md:py-0 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all font-bold text-xs"
                    title="Hapus Catatan"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="md:hidden">Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 pb-10">
            <Pagination
              page={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              total={paginationMeta.total}
              limit={paginationMeta.limit}
              onPageChange={(p: number) => fetchData(p)}
            />
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{editItem ? "Edit Catatan BK" : "Tambah Catatan BK"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl font-light">&times;</button>
            </div>
            
            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pilih Siswa <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={form.studentId} 
                      onChange={e => setForm({ ...form, studentId: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">— Pilih Siswa —</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Konselor</label>
                  <div className="relative">
                    <select 
                      value={form.counselorId} 
                      onChange={e => setForm({ ...form, counselorId: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">— Pilih Konselor —</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tanggal Kejadian</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({ ...form, date: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kategori <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={form.category} 
                      onChange={e => setForm({ ...form, category: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Status Kasus</label>
                  <div className="relative">
                    <select 
                      value={form.status} 
                      onChange={e => setForm({ ...form, status: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Deskripsi Kejadian / Keluhan</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    rows={4} 
                    placeholder="Ceritakan detail kejadian atau keluhan siswa secara lengkap..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-sm"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tindak Lanjut / Saran</label>
                  <textarea 
                    value={form.followUp} 
                    onChange={e => setForm({ ...form, followUp: e.target.value })} 
                    rows={3} 
                    placeholder="Apa langkah yang diambil setelah sesi konseling selesai?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit} 
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                {editItem ? "Simpan Perubahan" : "Simpan Catatan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

