"use client";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

export default function TeachingAssignmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for dropdowns (employees, subjects, classrooms, academicYears)
  const [employees, setEmployees] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  // Filter state
  const [filterYear, setFilterYear] = useState("");
  const [filterClass, setFilterClass] = useState("");

  async function loadMetadata() {
    try {
      const [empRes, subjRes, clsRes, yrRes] = await Promise.all([
        fetch('/api/teachers?limit=1000'),
        fetch('/api/subjects'),
        fetch('/api/classrooms'),
        fetch('/api/academic-years')
      ]);

      const empJson = await empRes.json();
      const subjJson = await subjRes.json();
      const clsJson = await clsRes.json();
      const yrJson = await yrRes.json();

      if (empJson.success && Array.isArray(empJson.data)) {
        setEmployees(empJson.data);
      } else {
        setEmployees([]);
      }

      if (subjJson.success && Array.isArray(subjJson.data)) {
        setSubjects(subjJson.data);
      } else {
        setSubjects([]);
      }

      if (clsJson.success && Array.isArray(clsJson.data)) {
        setClassrooms(clsJson.data);
      } else {
        setClassrooms([]);
      }
      
      if (yrJson.success && Array.isArray(yrJson.data)) {
        setAcademicYears(yrJson.data);
        const activeYear = yrJson.data.find((y: any) => y.isActive);
        if (activeYear) setFilterYear(activeYear.id.toString());
      } else {
        setAcademicYears([]);
      }
    } catch (e) {
      console.error("Gagal memuat metadata", e);
      setEmployees([]);
      setSubjects([]);
      setClassrooms([]);
      setAcademicYears([]);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      let url = `/api/teaching-assignments?`;
      if (filterYear) url += `academicYearId=${filterYear}&`;
      if (filterClass) url += `classroomId=${filterClass}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadData();
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

  const currentActiveYear = academicYears.find(y => y.isActive)?.id || '';

  const handleAdd = () => {
    Swal.fire({
      title: "Tambah Penugasan Guru",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Tahun Ajaran *</label>
            <select id="swal-ta-academicyear" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              ${getYrOptions(currentActiveYear)}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Guru / Pegawai *</label>
            <select id="swal-ta-employee" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="">-- Pilih Guru --</option>
              ${getEmpOptions()}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Mata Pelajaran *</label>
            <select id="swal-ta-subject" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="">-- Pilih Mapel --</option>
              ${getSubjOptions()}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Kelas *</label>
            <select id="swal-ta-classroom" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="">-- Pilih Kelas --</option>
              ${getClsOptions()}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const academicYearId = (document.getElementById("swal-ta-academicyear") as HTMLSelectElement).value;
        const employeeId = (document.getElementById("swal-ta-employee") as HTMLSelectElement).value;
        const subjectId = (document.getElementById("swal-ta-subject") as HTMLSelectElement).value;
        const classroomId = (document.getElementById("swal-ta-classroom") as HTMLSelectElement).value;

        if (!academicYearId || !employeeId || !subjectId || !classroomId) {
          Swal.showValidationMessage('Semua kolom wajib diisi');
          return false;
        }

        return {
          academicYearId: parseInt(academicYearId),
          employeeId: parseInt(employeeId),
          subjectId: parseInt(subjectId),
          classroomId: parseInt(classroomId)
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/teaching-assignments", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(r.value) 
          });
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Penugasan guru ditambahkan", "success"); 
            loadData(); 
          } else {
            Swal.fire("Gagal", json.error || "Gagal menyimpan penugasan", "error");
          }
        } catch { 
          Swal.fire("Error", "Server error", "error"); 
        }
      }
    });
  };

  const handleEdit = (assignment: any) => {
    Swal.fire({
      title: "Edit Penugasan Guru",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Tahun Ajaran *</label>
            <select id="swal-ta-academicyear" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              ${getYrOptions(assignment.academicYearId)}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Guru / Pegawai *</label>
            <select id="swal-ta-employee" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              ${getEmpOptions(assignment.employeeId)}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Mata Pelajaran *</label>
            <select id="swal-ta-subject" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              ${getSubjOptions(assignment.subjectId)}
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Kelas *</label>
            <select id="swal-ta-classroom" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              ${getClsOptions(assignment.classroomId)}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        return {
          academicYearId: parseInt((document.getElementById("swal-ta-academicyear") as HTMLSelectElement).value),
          employeeId: parseInt((document.getElementById("swal-ta-employee") as HTMLSelectElement).value),
          subjectId: parseInt((document.getElementById("swal-ta-subject") as HTMLSelectElement).value),
          classroomId: parseInt((document.getElementById("swal-ta-classroom") as HTMLSelectElement).value)
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/teaching-assignments/${assignment.id}`, { 
            method: "PUT", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(r.value) 
          });
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Penugasan diperbarui", "success"); 
            loadData(); 
          } else {
            Swal.fire("Gagal", json.error || "Gagal memperbarui", "error");
          }
        } catch { 
          Swal.fire("Error", "Server error", "error"); 
        }
      }
    });
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

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Penugasan Guru Mapel"
        subtitle="Tentukan guru mata pelajaran untuk tiap kelas pada Tahun Ajaran berjalan."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  data.map((d: any, i: number) => [i+1, d.employee?.name, d.subject?.name, d.subject?.code, d.classroom?.name, d.academicYear?.year]),
                  "data_penugasan_guru"
                );
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/20 transition-all uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export
            </button>
            <button 
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold border border-blue-400 shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider"
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

      <Card
        title="Daftar Penugasan"
        icon={<div className="w-2 h-2 rounded-full bg-amber-500" />}
        actions={
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{data.length}</span>
        }
        noPadding
      >
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[50px]">No</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Guru</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Mata Pelajaran</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Kelas</th>
                <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200">Tahun Ajaran</th>
                <th className="py-3 px-4 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b-[1.5px] border-slate-200 w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-[13px] text-slate-400">Memuat data penugasan...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-[13px] text-slate-400">Belum ada data penugasan.</td></tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 border-dashed last:border-0">
                    <td className="py-2.5 px-4 text-center text-[13px] font-semibold text-slate-400">{index + 1}</td>
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
      </Card>

      {data.length > 0 && (() => {
        const rekap: Record<string, { nama: string; jumlahKelas: number; mapelSet: Set<string> }> = {};
        data.forEach((d: any) => {
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
    </div>
  );
}
