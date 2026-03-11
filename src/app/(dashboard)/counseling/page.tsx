"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

interface Student { id: number; name: string; nisn: string; classroom?: { name: string }; }
interface Employee { id: number; name: string; }
interface CounselingRecord {
  id: number; studentId: number; counselorId: number | null;
  date: string; category: string; status: string; description: string; followUp: string;
  student: Student; counselor: Employee | null;
}

const categories = ["akademik", "perilaku", "sosial", "keluarga"];
const statuses = ["aktif", "proses", "selesai"];
const categoryColors: Record<string, string> = { akademik: "bg-blue-100 text-blue-700", perilaku: "bg-amber-100 text-amber-700", sosial: "bg-emerald-100 text-emerald-700", keluarga: "bg-purple-100 text-purple-700" };
const statusColors: Record<string, string> = { aktif: "bg-rose-100 text-rose-700", proses: "bg-amber-100 text-amber-700", selesai: "bg-emerald-100 text-emerald-700" };

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/counseling?";
      if (filterCategory) url += `category=${filterCategory}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      const res = await fetch(url);
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterCategory, filterStatus]);

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
    const r = await Swal.fire({ title: "Hapus catatan BK?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (!r.isConfirmed) return;
    await fetch(`/api/counseling/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: CounselingRecord) => {
    setEditItem(item);
    setForm({ studentId: item.studentId.toString(), counselorId: item.counselorId?.toString() || "", date: item.date, category: item.category, description: item.description, followUp: item.followUp, status: item.status });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Bimbingan Konseling</h1>
          <p className="text-sm text-slate-500 mt-1">Catatan bimbingan dan konseling siswa</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(null); setForm({ studentId: "", counselorId: "", date: new Date().toISOString().split("T")[0], category: "akademik", description: "", followUp: "", status: "aktif" }); setShowModal(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Tambah Catatan
          </button>
          <button onClick={() => {
            if (!data.length) return;
            exportCSV(["No", "Tanggal", "Siswa", "Kategori", "Status", "Deskripsi", "Tindak Lanjut"],
              data.map((d, i) => [i + 1, d.date, d.student?.name || "", d.category, d.status, d.description, d.followUp]), "catatan_bk");
          }} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Kategori</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Semua</option>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Semua</option>
            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-sm text-slate-500">Belum ada catatan BK</p></div>
      ) : (
        <div className="space-y-3">
          {data.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-800">{item.student?.name || "—"}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${categoryColors[item.category] || "bg-slate-100 text-slate-600"}`}>{item.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[item.status] || "bg-slate-100 text-slate-600"}`}>{item.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">Konselor: {item.counselor?.name || "-"} · Tanggal: {item.date}</p>
                  {item.description && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3">{item.description}</p>}
                  {item.followUp && <p className="text-xs text-slate-500 mt-1">Tindak lanjut: {item.followUp}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleEdit(item)} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[11px] font-semibold border border-indigo-100 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-100 transition-colors">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Catatan BK" : "Tambah Catatan BK"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-600">Siswa *</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">— Pilih Siswa —</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>)}
                </select></div>
              <div><label className="text-xs font-semibold text-slate-600">Konselor</label>
                <select value={form.counselorId} onChange={e => setForm({ ...form, counselorId: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">— Pilih —</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select></div>
              <div><label className="text-xs font-semibold text-slate-600">Tanggal</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600">Kategori *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select></div>
              <div><label className="text-xs font-semibold text-slate-600">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select></div>
              <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-600">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" /></div>
              <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-600">Tindak Lanjut</label>
                <textarea value={form.followUp} onChange={e => setForm({ ...form, followUp: e.target.value })} rows={2} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
