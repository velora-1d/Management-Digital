"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import LeftDrawer from "@/components/ui/LeftDrawer";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { CheckCircle2, Trash2 } from "lucide-react";

interface TAItem { 
  id: number; 
  employeeId: number | null; 
  subjectId: number | null; 
  classroomId: number | null; 
  academicYearId: number | null; 
  employee?: { name: string } | null; 
  subject?: { name: string; code: string } | null; 
  classroom?: { name: string } | null; 
  academicYear?: { year: string; isActive: boolean; semester?: string } | null; 
}
interface DropdownItem { id: number; name: string; code?: string; type?: string; isActive?: boolean; year?: string; semester?: string; }
interface InitialResult {
  data: TAItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function TeachingAssignmentsClient({
  initialResult,
  initialTeachers = [],
  initialSubjects = [],
  initialClassrooms = [],
  initialAcademicYears = [],
}: {
  initialResult?: InitialResult;
  initialTeachers?: DropdownItem[];
  initialSubjects?: DropdownItem[];
  initialClassrooms?: DropdownItem[];
  initialAcademicYears?: DropdownItem[];
}) {
  // States untuk data utama dengan initialData dari server
  const [data, setData] = useState<TAItem[]>(initialResult?.data || []);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paginationMeta, setPaginationMeta] = useState(
    initialResult?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TAItem | null>(null);
  const [formData, setFormData] = useState({
    academicYearId: "",
    employeeId: "",
    subjectId: "",
    classroomId: "",
  });

  // States for dropdowns — langsung diisi dari server-side props
  const [employees] = useState<DropdownItem[]>(initialTeachers);
  const [subjects] = useState<DropdownItem[]>(initialSubjects);
  const [classrooms] = useState<DropdownItem[]>(initialClassrooms);
  const [academicYears] = useState<DropdownItem[]>(initialAcademicYears);

  // Filter state
  const [filterYear, setFilterYear] = useState("");
  const [filterClass, setFilterClass] = useState("");

  async function loadData(page = 1) {
    setLoading(true);
    try {
      let url = `/api/teaching-assignments?page=${page}&limit=${paginationMeta.limit}&`;
      if (filterYear) url += `academicYearId=${filterYear}&`;
      if (filterClass) url += `classroomId=${filterClass}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.pagination) {
          setPaginationMeta(json.pagination);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Auto-select tahun ajaran aktif dari initial data server
  useEffect(() => {
    if (initialAcademicYears.length > 0) {
      const activeYear = initialAcademicYears.find((y) => y.isActive);
      if (activeYear) setFilterYear(activeYear.id.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Jangan load ulang jika data sudah ada dari server (page 1, no filter)
    if (data.length > 0 && !filterYear && !filterClass) return;
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterClass]);

  const getEmpOptions = (selectedId?: number) => {
    return employees.map(e => `<option value="${e.id}" ${selectedId === e.id ? 'selected' : ''}>${e.name}</option>`).join('');
  };
  const getSubjOptions = (selectedId?: number) => {
    return subjects.map(s => `<option value="${s.id}" ${selectedId === s.id ? 'selected' : ''}>${s.name} (${s.type})</option>`).join('');
  };
  const getClsOptions = (selectedId?: number) => {
    return classrooms.map(c => `<option value="${c.id}" ${selectedId === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  };
  const getYrOptions = (selectedId?: number) => {
    return academicYears.map(y => `<option value="${y.id}" ${selectedId === y.id ? 'selected' : ''}>${y.year} - ${y.isActive ? 'Aktif' : 'Tidak Aktif'}</option>`).join('');
  };

  const currentActiveYear = academicYears.find(y => y.isActive)?.id;

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setFormData({
      academicYearId: currentActiveYear ? String(currentActiveYear) : (academicYears[0]?.id ? String(academicYears[0].id) : ""),
      employeeId: "",
      subjectId: "",
      classroomId: "",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (assignment: TAItem) => {
    setEditingAssignment(assignment);
    setFormData({
      academicYearId: assignment.academicYearId ? String(assignment.academicYearId) : "",
      employeeId: assignment.employeeId ? String(assignment.employeeId) : "",
      subjectId: assignment.subjectId ? String(assignment.subjectId) : "",
      classroomId: assignment.classroomId ? String(assignment.classroomId) : "",
    });
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.academicYearId || !formData.employeeId || !formData.subjectId || !formData.classroomId) {
      Swal.fire("Peringatan", "Semua kolom wajib diisi", "warning");
      return;
    }

    try {
      const url = editingAssignment ? `/api/teaching-assignments/${editingAssignment.id}` : "/api/teaching-assignments";
      const method = editingAssignment ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYearId: parseInt(formData.academicYearId),
          employeeId: parseInt(formData.employeeId),
          subjectId: parseInt(formData.subjectId),
          classroomId: parseInt(formData.classroomId),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsDrawerOpen(false);
        setEditingAssignment(null);
        Swal.fire(
          "Berhasil",
          editingAssignment ? "Penugasan diperbarui" : "Penugasan guru ditambahkan",
          "success"
        );
        loadData();
      } else {
        Swal.fire("Gagal", json.error || "Gagal menyimpan penugasan", "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Hapus Penugasan?",
      text: "Data yang dihapus (soft delete) tidak akan tampil.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/teaching-assignments/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Dihapus", "success"); 
            loadData(); 
          } else {
            Swal.fire("Gagal", json.error || "Gagal", "error");
          }
        } catch { 
          Swal.fire("Error", "Server error", "error"); 
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Penugasan Terpilih?",
      text: `Anda akan menghapus ${selectedIds.length} penugasan guru terpilih.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/teaching-assignments/${id}`, { method: "DELETE" })));
      Swal.fire("Berhasil", `${selectedIds.length} penugasan berhasil dihapus`, "success");
      setSelectedIds([]);
      loadData();
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa penugasan", "error");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Penugasan Guru Mapel"
        subtitle="Tentukan guru mata pelajaran untuk tiap kelas pada Tahun Ajaran berjalan."
        icon={
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (data.length === 0) { Swal.fire("Info", "Tidak ada data untuk diekspor", "info"); return; }
                exportCSV(
                  ["No", "Guru", "Mata Pelajaran", "Kode", "Kelas", "Tahun Ajaran"],
                  data.map((d, i: number) => [i+1, d.employee?.name || "-", d.subject?.name || "-", d.subject?.code || "-", d.classroom?.name || "-", d.academicYear?.year || "-"]),
                  "data_penugasan_guru"
                );
              }}
              className="inline-flex items-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all uppercase tracking-wider shadow-xs"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export
            </button>
            <button 
              onClick={handleOpenAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs uppercase tracking-wider cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Penugasan
            </button>
          </div>
        }
      />

      <Card noPadding>
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Filter Tahun Ajaran</label>
            <select 
              value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
              className="w-full text-sm border-slate-200 rounded-lg bg-white py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="">Semua Tahun Ajaran</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.year} - {y.semester}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Filter Kelas</label>
            <select 
              value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
              className="w-full text-sm border-slate-200 rounded-lg bg-white py-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="">Semua Kelas</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in mb-4">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{selectedIds.length} penugasan dipilih</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBulkDelete}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <Card
        title="Daftar Penugasan"
        icon={<div className="w-2 h-2 rounded-full bg-amber-500" />}
        actions={
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{paginationMeta.total}</span>
        }
        noPadding
      >
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left bg-white">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="bg-linear-to-b from-slate-50 to-slate-100/50">
                <th className="py-3 px-4 text-center border-b-[1.5px] border-slate-200 w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? data.map(d => d.id) : [])}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label="Pilih semua penugasan"
                  />
                </th>
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[50px]">No</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Guru</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Mata Pelajaran</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Kelas</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Tahun Ajaran</th>
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-[13px] text-slate-400">Memuat data penugasan...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-[13px] text-slate-400">Belum ada data penugasan.</td></tr>
              ) : (
                data.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 border-dashed last:border-0 ${isSelected ? "bg-blue-50/40" : ""}`}>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== item.id));
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        aria-label={`Pilih penugasan ${item.employee?.name}`}
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center text-[13px] font-semibold text-slate-400">{((paginationMeta.page - 1) * paginationMeta.limit) + index + 1}</td>
                    <td className="py-2.5 px-4 text-[13px] font-semibold text-slate-800">
                      {item.employee?.name}
                    </td>
                    <td className="py-2.5 px-4 text-[13px] text-slate-700">
                      {item.subject?.name} <span className="text-slate-400 text-[11px]">({item.subject?.code})</span>
                    </td>
                    <td className="py-2.5 px-4 text-[13px] font-semibold text-slate-600">
                      <span className="inline-flex bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">{item.classroom?.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-[12px] text-slate-500">{item.academicYear?.year} / {item.academicYear?.isActive ? 'Aktif' : 'Tidak Aktif'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEdit(item)} className="inline-flex py-1 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 hover:border-blue-200 rounded text-center transition-colors cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="inline-flex py-1 px-2.5 text-[11px] font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 hover:border-rose-200 rounded text-center transition-colors cursor-pointer">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ); })
              )}
              {!loading && data.length > 0 && data.length < (paginationMeta?.limit || 10) && (
                Array.from({ length: (paginationMeta?.limit || 10) - data.length }).map((_, i) => (
                  <tr key={`filler-${i}`} style={{ height: "45px" }} className="border-b border-slate-100 border-dashed last:border-0 bg-white">
                    <td className="py-2.5 px-4">&nbsp;</td>
                    <td className="py-2.5 px-4">&nbsp;</td>
                    <td className="py-2.5 px-4">&nbsp;</td>
                    <td className="py-2.5 px-4">&nbsp;</td>
                    <td className="py-2.5 px-4">&nbsp;</td>
                    <td className="py-2.5 px-4 text-center">&nbsp;</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          <div className="p-4 border-t border-slate-100">
            <Pagination
              page={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              total={paginationMeta.total}
              limit={paginationMeta.limit}
              onPageChange={(p: number) => loadData(p)}
            />
          </div>
        </div>
      </Card>

      {data.length > 0 && (() => {
        const rekap: Record<string, { nama: string; jumlahKelas: number; mapelSet: Set<string> }> = {};
        data.forEach((d) => {
          const key = d.employee?.name || "Unknown";
          if (!rekap[key]) rekap[key] = { nama: key, jumlahKelas: 0, mapelSet: new Set() };
          rekap[key].jumlahKelas++;
          if (d.subject?.name) rekap[key].mapelSet.add(d.subject.name);
        });
        const rekapArr = Object.values(rekap).sort((a, b) => b.jumlahKelas - a.jumlahKelas);
        return (
          <Card
            title="Rekap Beban Mengajar"
            icon={<div className="w-2 h-2 rounded-full bg-emerald-500" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rekapArr.map(r => (
                <div key={r.nama} className="p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/10 transition-all group">
                  <p className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{r.nama}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">{r.jumlahKelas} kelas · {r.mapelSet.size} mapel</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(r.mapelSet).map(m => (
                      <span key={m} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">{m}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* LeftDrawer Form Tambah & Edit Penugasan Guru */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingAssignment(null);
        }}
        title={editingAssignment ? "Edit Penugasan Guru" : "Tambah Penugasan Guru"}
        subtitle="Petakan guru pengajar, mata pelajaran, dan ruang kelas"
        width="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.academicYearId}
              onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year} {ay.isActive ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Guru Pengajar <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Pilih Guru / Pegawai --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Pelajaran <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ruang Kelas <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.classroomId}
              onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Pilih Kelas --</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setEditingAssignment(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingAssignment ? "Simpan Perubahan" : "Simpan Penugasan"}
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
