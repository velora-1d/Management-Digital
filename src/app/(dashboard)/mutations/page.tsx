"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { ArrowRightLeft } from "lucide-react";
import Pagination from "@/components/Pagination";
import { ExportButtons } from "@/lib/export-utils";

export default function MutationsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [action, setAction] = useState("pindah_kelas");
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents(selectedClass, page);
    else {
      setStudents([]);
      setPagination({ total: 0, page: 1, limit: 20, totalPages: 0 });
    }
    setSelected([]);
  }, [selectedClass, page]);

  const loadClassrooms = async () => {
    try {
      const res = await fetch("/api/classrooms");
      const json = await res.json();
      if (json.success) setClassrooms(json.data || []);
    } catch (e) { console.error(e); }
  };

  const loadStudents = async (classId: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?classroom=${classId}&page=${pageNum}&limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      }
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
        if (selectedClass) loadStudents(selectedClass, page);
      } else {
        Swal.fire("Gagal", json.message || "Terjadi kesalahan", "error");
      }
    } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
    finally { setExecuting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <PageHeader
        title="Mutasi Siswa"
        subtitle="Pindah kelas, kelulusan, atau perubahan status siswa."
        icon={<ArrowRightLeft className="w-6 h-6 text-white" />}
        gradient="from-red-600 via-rose-500 to-red-500"
        actions={
          <div className="flex items-center gap-2">
            <ExportButtons 
              options={{
                title: "Data Calon Mutasi Siswa",
                filename: `mutasi_siswa_${new Date().toISOString().split("T")[0]}`,
                columns: [
                  { header: "No", key: "_no", width: 8, align: "center" },
                  { header: "NISN", key: "nisn", width: 15 },
                  { header: "Nama Siswa", key: "name", width: 35 },
                  { header: "JK", key: "gender", width: 10, align: "center" },
                  { header: "Status", key: "status", width: 15, align: "center" },
                ],
                data: students.map((s: any, i: number) => ({
                  ...s,
                  _no: (page - 1) * limit + i + 1,
                })),
              }}
            />
          </div>
        }
      />

      {/* Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Kelas Asal</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setPage(1); }} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white">
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
      </Card>

      {/* Tabel Siswa */}
      <Card className="p-0 overflow-hidden">
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
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 w-12">No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">NISN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Nama Siswa</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">JK</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">Status</th>
              </tr>
            </thead>
            <tbody>
              {!selectedClass ? (
                <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-400">Pilih kelas asal untuk melihat daftar siswa.</td></tr>
              ) : loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-400">Memuat...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-400">Tidak ada siswa di kelas ini.</td></tr>
              ) : (
                students.map((s, i) => (
                  <tr key={s.id} onClick={() => toggleSelect(s.id)} className={`border-b border-slate-100 cursor-pointer transition-colors ${selected.includes(s.id) ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" checked={selected.includes(s.id)} readOnly className="w-4 h-4 accent-indigo-600" />
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-slate-400">{(page - 1) * limit + i + 1}</td>
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
        {students.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              total={pagination.total}
              limit={limit}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
