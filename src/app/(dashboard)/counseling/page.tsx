"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { ExportButtons } from "@/lib/export-utils";
import LeftDrawer from "@/components/ui/LeftDrawer";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  User, 
  Calendar as CalendarIcon, 
  FileText, 
  CornerDownRight,
  ChevronDown,
  CheckCircle2
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
  keluarga: "bg-cyan-50 text-cyan-600 border-cyan-100" 
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
    fetch("/api/students?limit=1000")
      .then(r => r.json())
      .then(d => setStudents(d.success ? (d.data || []) : (Array.isArray(d) ? d : [])));
    fetch("/api/teachers?limit=1000")
      .then(r => r.json())
      .then(d => {
        const items = d.success ? (d.data || []) : (Array.isArray(d) ? d : []);
        setTeachers(items.filter((t: { status?: string }) => !t.status || t.status === "aktif"));
      });
  }, []);

  const handleSubmit = async () => {
    if (!form.studentId || !form.category) { Swal.fire("Error", "Siswa dan kategori wajib", "error"); return; }
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/counseling/${editItem.id}` : "/api/counseling";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghubungi server");
      }
      const json = await res.json();
      if (json.success) {
        setShowModal(false); setEditItem(null);
        setForm({ studentId: "", counselorId: "", date: new Date().toISOString().split("T")[0], category: "akademik", description: "", followUp: "", status: "aktif" });
        fetchData();
        Swal.fire("Berhasil", editItem ? "Catatan BK diperbarui" : "Catatan BK ditambahkan", "success");
      } else {
        Swal.fire("Gagal", json.message || "Gagal menyimpan data", "error");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
      Swal.fire("Error", msg, "error");
    }
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
    try {
      const res = await fetch(`/api/counseling/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghubungi server");
      }
      const json = await res.json();
      if (json.success) {
        fetchData();
        Swal.fire("Berhasil", "Catatan telah dihapus", "success");
      } else {
        Swal.fire("Gagal", json.message || "Gagal menghapus", "error");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Catatan Terpilih?",
      text: `Anda akan menghapus ${selectedIds.length} catatan BK terpilih.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/counseling/${id}`, { method: "DELETE" })));
      Swal.fire("Berhasil", `${selectedIds.length} catatan berhasil dihapus`, "success");
      setSelectedIds([]);
      fetchData();
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa catatan", "error");
    }
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
        icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
        actions={
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditItem(null); setForm({ studentId: "", counselorId: "", date: new Date().toISOString().split("T")[0], category: "akademik", description: "", followUp: "", status: "aktif" }); setShowModal(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
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
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                className="bg-slate-50 border-none rounded-xl py-2 pl-9 pr-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
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
                className="bg-slate-50 border-none rounded-xl py-2 px-4 pr-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-medium">Belum ada catatan bimbingan konseling</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk Selection Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-sm text-blue-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{selectedIds.length} catatan terpilih</span>
              </div>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
          )}

          {/* Select All Toggle */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 font-medium">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.length > 0 && selectedIds.length === data.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(data.map(item => item.id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Pilih Semua di Halaman Ini</span>
            </label>
            <span>Total: {paginationMeta.total} catatan</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.map((item, idx) => {
              const itemNo = (paginationMeta.page - 1) * paginationMeta.limit + idx + 1;
              const isSelected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className={`group bg-white rounded-3xl border transition-all p-5 ${isSelected ? "border-blue-400 bg-blue-50/20 shadow-md" : "border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100"}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Checkbox and No */}
                    <div className="flex md:flex-col items-center justify-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, item.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center justify-center">
                        {itemNo}
                      </span>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
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
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-200"></div>
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
                            <p className="text-sm text-slate-600 leading-relaxed italic">&quot;{item.followUp}&quot;</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6 px-2">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="flex-1 md:w-10 md:h-10 flex items-center justify-center gap-2 md:gap-0 px-4 md:px-0 py-2 md:py-0 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold text-xs"
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
              );
            })}
          </div>
          
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

      {/* Form Drawer */}
      <LeftDrawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? "Edit Catatan BK" : "Tambah Catatan BK"}
        subtitle="Kelola catatan bimbingan konseling dan penanganan siswa"
        width="max-w-xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pilih Siswa <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  value={form.studentId} 
                  onChange={e => setForm({ ...form, studentId: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kategori <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Tindak Lanjut / Saran</label>
              <textarea 
                value={form.followUp} 
                onChange={e => setForm({ ...form, followUp: e.target.value })} 
                rows={3} 
                placeholder="Apa langkah yang diambil setelah sesi konseling selesai?"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setShowModal(false)} 
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              Batal
            </button>
            <button 
              type="button"
              onClick={handleSubmit} 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              {editItem ? "Simpan Perubahan" : "Simpan Catatan"}
            </button>
          </div>
        </div>
      </LeftDrawer>
    </div>
  );
}

