"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { 
  Plus, 
  Download, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Trophy
} from "lucide-react";

interface Employee { id: number; name: string; }
interface Student { id: number; name: string; nisn: string; }
interface Member { id: number; studentId: number; score: number; predicate: string; student: Student; }
interface Extracurricular { id: number; name: string; schedule: string; status: string; employeeId: number | null; employee: Employee | null; members: Member[]; }

export default function ExtracurricularPage() {
  const [data, setData] = useState<Extracurricular[]>([]);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Extracurricular | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignTargetId, setAssignTargetId] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [form, setForm] = useState({ name: "", employeeId: "", schedule: "", status: "aktif" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/extracurricular");
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    fetch("/api/teachers").then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d.filter((t: { status?: string }) => !t.status || t.status === "aktif") : []));
    fetch("/api/students").then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.name) { Swal.fire("Error", "Nama ekskul wajib", "error"); return; }
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `/api/extracurricular/${editItem.id}` : "/api/extracurricular";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setEditItem(null); setForm({ name: "", employeeId: "", schedule: "", status: "aktif" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Ekskul diperbarui" : "Ekskul ditambahkan", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ 
      title: "Hapus ekskul?", 
      text: "Data anggota dan nilai juga akan dihapus.",
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    });
    if (!r.isConfirmed) return;
    await fetch(`/api/extracurricular/${id}`, { method: "DELETE" });
    fetchData();
    Swal.fire("Berhasil", "Ekskul telah dihapus", "success");
  };

  const handleEdit = (item: Extracurricular) => {
    setEditItem(item);
    setForm({ name: item.name, employeeId: item.employeeId?.toString() || "", schedule: item.schedule, status: item.status });
    setShowModal(true);
  };

  const openAssign = (ekskulId: number) => {
    setAssignTargetId(ekskulId);
    const existing = data.find(d => d.id === ekskulId)?.members.map(m => m.studentId) || [];
    setSelectedStudents(existing);
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!assignTargetId) return;
    await fetch("/api/extracurricular/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extracurricularId: assignTargetId, studentIds: selectedStudents }),
    });
    setShowAssign(false); fetchData();
    Swal.fire("Berhasil", "Anggota diperbarui", "success");
  };

  const handleUpdatePredicate = async (memberId: number, predicate: string) => {
    await fetch("/api/extracurricular/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: [{ id: memberId, predicate }] }),
    });
    fetchData();
  };

  const handleRemoveMember = async (memberId: number) => {
    const r = await Swal.fire({
      title: "Hapus anggota?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus"
    });
    if (!r.isConfirmed) return;
    await fetch(`/api/extracurricular/members?id=${memberId}`, { method: "DELETE" });
    fetchData();
    Swal.fire("Berhasil", "Anggota dihapus dari ekskul", "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ekstrakurikuler" 
        subtitle="Kelola kegiatan ekstrakurikuler, anggota, dan penilaian"
        icon={<Trophy />}
        actions={
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditItem(null); setForm({ name: "", employeeId: "", schedule: "", status: "aktif" }); setShowModal(true); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Ekskul
            </button>
            <button 
              onClick={() => {
                if (!data.length) return;
                const rows = data.flatMap(e => e.members.length ? e.members.map((m, i) => [i === 0 ? e.name : "", m.student.name, m.student.nisn, m.predicate || "-"]) : [[e.name, "-", "-", "-"]]);
                exportCSV(["Ekskul", "Nama Siswa", "NISN", "Predikat"], rows, "daftar_ekskul");
              }} 
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        }
      />

      <Card noPadding>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 m-4 rounded-xl">
            <p className="text-sm text-slate-500">Belum ada data ekstrakurikuler</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.map(item => (
              <div key={item.id} className="group">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div 
                    className="flex items-center gap-4 cursor-pointer flex-1" 
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${item.status === "aktif" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                      <Users className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px] font-bold">{item.members.length}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 uppercase tracking-tight">
                        <span className="font-semibold text-slate-700">Pembina:</span> {item.employee?.name || "—"} 
                        <span className="text-slate-300">|</span>
                        <span className="font-semibold text-slate-700">Jadwal:</span> {item.schedule || "Belum dijadwalkan"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => openAssign(item.id)} 
                      title="Tambah Anggota"
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(item)} 
                      title="Edit Ekskul"
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      title="Hapus Ekskul"
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                    <button 
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className={`p-2 text-slate-400 hover:text-slate-600 transition-transform ${expandedId === item.id ? "rotate-180" : ""}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {expandedId === item.id && (
                  <div className="bg-slate-50/50 p-6 border-y border-slate-100">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daftar Anggota Ekskul</h4>
                      <p className="text-xs text-slate-400 font-medium">{item.members.length} Siswa Terdaftar</p>
                    </div>
                    
                    {item.members.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                        <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Belum ada anggota terdaftar</p>
                        <button 
                          onClick={() => openAssign(item.id)}
                          className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Klik untuk Menambah Anggota
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              <th className="py-3 px-4 font-bold">Nama Siswa</th>
                              <th className="py-3 px-4 font-bold">NISN</th>
                              <th className="py-3 px-4 font-bold">Predikat / Nilai</th>
                              <th className="py-3 px-4 font-bold text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {item.members.map(m => (
                              <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="py-3 px-4 text-sm font-semibold text-slate-800">{m.student.name}</td>
                                <td className="py-3 px-4 text-xs font-mono text-slate-500">{m.student.nisn}</td>
                                <td className="py-3 px-4">
                                  <select 
                                    value={m.predicate || ""} 
                                    onChange={(e) => handleUpdatePredicate(m.id, e.target.value)}
                                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[160px] bg-white shadow-sm"
                                  >
                                    <option value="">— Pilih Predikat —</option>
                                    <option value="Sangat Baik">Sangat Baik</option>
                                    <option value="Baik">Baik</option>
                                    <option value="Cukup">Cukup</option>
                                    <option value="Kurang">Kurang</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button 
                                    onClick={() => handleRemoveMember(m.id)} 
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Keluarkan Anggota"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Ekskul" : "Tambah Ekskul"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-light">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Nama Ekskul <span className="text-rose-500">*</span></label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="Contoh: Pramuka, Basket"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Guru Pembina</label>
                  <select 
                    value={form.employeeId} 
                    onChange={e => setForm({ ...form, employeeId: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm bg-white"
                  >
                    <option value="">— Pilih Guru Pembina —</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Jadwal Latihan</label>
                  <input 
                    value={form.schedule} 
                    onChange={e => setForm({ ...form, schedule: e.target.value })} 
                    placeholder="Contoh: Jumat 15:00-17:00" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
                  <div className="flex gap-2">
                    {["aktif", "nonaktif"].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                          form.status === s 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 -mx-6 px-6 mt-4">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assign Anggota */}
      {showAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assign Anggota</h2>
                <p className="text-sm text-slate-500">Pilih siswa yang akan mengikuti ekstrakurikuler</p>
              </div>
              <div className="bg-indigo-100 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-indigo-700">{selectedStudents.length} Terpilih</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-2 bg-white">
              <div className="sticky top-0 pb-4 bg-white z-10">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Cari nama atau NISN..." 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 pl-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {students.map(s => (
                <label key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedStudents.includes(s.id) 
                    ? "bg-indigo-50/50 border-indigo-200" 
                    : "bg-white border-transparent hover:bg-slate-50"
                }`}>
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(s.id)} 
                    onChange={(e) => {
                      setSelectedStudents(e.target.checked ? [...selectedStudents, s.id] : selectedStudents.filter(id => id !== s.id));
                    }} 
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{s.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-tighter mt-0.5">{s.nisn}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
              <button 
                onClick={() => setShowAssign(false)} 
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleAssign} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100"
              >
                Simpan ({selectedStudents.length} Siswa)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

