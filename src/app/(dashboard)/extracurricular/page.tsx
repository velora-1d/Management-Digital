"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

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
    const r = await Swal.fire({ title: "Hapus ekskul?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (!r.isConfirmed) return;
    await fetch(`/api/extracurricular/${id}`, { method: "DELETE" });
    fetchData();
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
    await fetch(`/api/extracurricular/members?id=${memberId}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Ekstrakurikuler</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola kegiatan ekstrakurikuler, anggota, dan penilaian</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(null); setForm({ name: "", employeeId: "", schedule: "", status: "aktif" }); setShowModal(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Tambah Ekskul
          </button>
          <button onClick={() => {
            if (!data.length) return;
            const rows = data.flatMap(e => e.members.length ? e.members.map((m, i) => [i === 0 ? e.name : "", m.student.name, m.student.nisn, m.predicate || "-"]) : [[e.name, "-", "-", "-"]]);
            exportCSV(["Ekskul", "Nama Siswa", "NISN", "Predikat"], rows, "daftar_ekskul");
          }} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-sm text-slate-500">Belum ada data ekstrakurikuler</p></div>
      ) : (
        <div className="space-y-3">
          {data.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${item.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {item.members.length}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">Pembina: {item.employee?.name || "-"} · {item.schedule || "Belum dijadwalkan"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${item.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.status}</span>
                  <button onClick={() => openAssign(item.id)} className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded text-[11px] font-semibold border border-sky-100 transition-colors">+ Anggota</button>
                  <button onClick={() => handleEdit(item)} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[11px] font-semibold border border-indigo-100 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-100 transition-colors">Hapus</button>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === item.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {expandedId === item.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                  {item.members.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Belum ada anggota</p>
                  ) : (
                    <table className="w-full text-left"><thead><tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                      <th className="py-2 px-3">Nama</th><th className="py-2 px-3">NISN</th><th className="py-2 px-3">Predikat</th><th className="py-2 px-3 text-center">Aksi</th>
                    </tr></thead><tbody className="divide-y divide-slate-100">
                      {item.members.map(m => (
                        <tr key={m.id} className="hover:bg-white transition-colors">
                          <td className="py-2 px-3 text-sm font-medium text-slate-800">{m.student.name}</td>
                          <td className="py-2 px-3 text-xs text-slate-500">{m.student.nisn}</td>
                          <td className="py-2 px-3">
                            <select value={m.predicate} onChange={(e) => handleUpdatePredicate(m.id, e.target.value)}
                              className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none">
                              <option value="">— Pilih —</option>
                              <option value="Sangat Baik">Sangat Baik</option>
                              <option value="Baik">Baik</option>
                              <option value="Cukup">Cukup</option>
                              <option value="Kurang">Kurang</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button onClick={() => handleRemoveMember(m.id)} className="text-rose-500 hover:text-rose-700 text-xs">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody></table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Ekskul" : "Tambah Ekskul"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-600">Nama Ekskul *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600">Pembina</label>
                <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">— Pilih Guru —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select></div>
              <div><label className="text-xs font-semibold text-slate-600">Jadwal</label>
                <input value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} placeholder="Jumat 15:00-17:00" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option>
                </select></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assign Anggota */}
      {showAssign && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800">Assign Anggota</h2>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {students.map(s => (
                <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={(e) => {
                    setSelectedStudents(e.target.checked ? [...selectedStudents, s.id] : selectedStudents.filter(id => id !== s.id));
                  }} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-800">{s.name}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">{s.nisn}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Batal</button>
              <button onClick={handleAssign} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan ({selectedStudents.length} siswa)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
