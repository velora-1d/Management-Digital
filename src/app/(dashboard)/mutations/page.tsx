"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function MutationsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [action, setAction] = useState("pindah_kelas");
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents(selectedClass);
    else setStudents([]);
    setSelected([]);
  }, [selectedClass]);

  const loadClassrooms = async () => {
    try {
      const res = await fetch("/api/classrooms");
      const json = await res.json();
      if (json.success) setClassrooms(json.data || []);
    } catch (e) { console.error(e); }
  };

  const loadStudents = async (classId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?classroom=${classId}`);
      const json = await res.json();
      if (json.success) setStudents(json.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selected.length === students.length) setSelected([]);
    else setSelected(students.map(s => s.id));
  };

  const handleExecute = async () => {
    if (selected.length === 0) return Swal.fire("Peringatan", "Pilih minimal 1 siswa", "warning");
    if (action === "pindah_kelas" && !targetClass) return Swal.fire("Peringatan", "Pilih kelas tujuan", "warning");

    const actionLabels: Record<string, string> = {
      pindah_kelas: "Pindah Kelas",
      lulus: "Kelulusan",
      pindah: "Pindah Sekolah",
      nonaktif: "Non-aktifkan",
    };

    const r = await Swal.fire({
      title: `Konfirmasi ${actionLabels[action]}`,
      text: `${selected.length} siswa akan diproses. Lanjutkan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Proses",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4f46e5",
    });

    if (!r.isConfirmed) return;

    setExecuting(true);
    try {
      const res = await fetch("/api/mutations/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selected,
          action: action,
          targetClassroomId: action === "pindah_kelas" ? Number(targetClass) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", json.message, "success");
        setSelected([]);
        if (selectedClass) loadStudents(selectedClass);
      } else {
        Swal.fire("Gagal", json.message || "Terjadi kesalahan", "error");
      }
    } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    finally { setExecuting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#dc2626 0%,#ef4444 50%,#f87171 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
              <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Mutasi Siswa</h2>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Pindah kelas, kelulusan, atau perubahan status siswa.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Kelas Asal</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white">
              <option value="">— Pilih Kelas —</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Aksi Mutasi</label>
            <select value={action} onChange={e => setAction(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white">
              <option value="pindah_kelas">Pindah Kelas</option>
              <option value="lulus">Kelulusan</option>
              <option value="pindah">Pindah Sekolah</option>
              <option value="nonaktif">Non-aktifkan</option>
            </select>
          </div>
          {action === "pindah_kelas" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Kelas Tujuan</label>
              <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white">
                <option value="">— Pilih —</option>
                {classrooms.filter(c => c.id.toString() !== selectedClass).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button onClick={handleExecute} disabled={executing || selected.length === 0} className="w-full px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {executing ? "Memproses..." : `Eksekusi (${selected.length} siswa)`}
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Siswa */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-500 to-rose-500"></div>
            <h4 className="font-bold text-slate-800 text-sm">Daftar Siswa {selectedClass ? "" : "(Pilih Kelas Terlebih Dahulu)"}</h4>
          </div>
          {students.length > 0 && (
            <button onClick={toggleAll} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              {selected.length === students.length ? "Batal Semua" : "Pilih Semua"}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 w-12">✓</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">NISN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Nama Siswa</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">JK</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {!selectedClass ? (
                <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-400">Pilih kelas asal untuk melihat daftar siswa.</td></tr>
              ) : loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-400">Memuat...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-400">Tidak ada siswa di kelas ini.</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} onClick={() => toggleSelect(s.id)} className={`border-b border-slate-100 cursor-pointer transition-colors ${selected.includes(s.id) ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" checked={selected.includes(s.id)} readOnly className="w-4 h-4 accent-indigo-600" />
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{s.nisn || "-"}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-slate-800">{s.name}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${s.gender === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>{s.gender}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700">{s.status || "aktif"}</span>
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
