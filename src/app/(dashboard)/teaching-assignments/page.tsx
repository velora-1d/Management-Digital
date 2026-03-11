"use client";
import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

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
        fetch('/api/employees?type=guru'),
        fetch('/api/subjects'),
        fetch('/api/classrooms'),
        fetch('/api/academic-years')
      ]);

      const empJson = await empRes.json();
      const subjJson = await subjRes.json();
      const clsJson = await clsRes.json();
      const yrJson = await yrRes.json();

      if (empJson.success) setEmployees(empJson.data);
      if (subjJson.success) setSubjects(subjJson.data);
      if (clsJson.success) setClassrooms(clsJson.data);
      
      if (yrJson.success) {
        setAcademicYears(yrJson.data);
        const activeYear = yrJson.data.find((y: any) => y.isActive);
        if (activeYear) setFilterYear(activeYear.id.toString());
      }
    } catch (e) {
      console.error("Gagal memuat metadata", e);
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#b45309 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
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
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Penugasan Guru Mapel</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Tentukan guru mata pelajaran untuk tiap kelas pada Tahun Ajaran berjalan.</p>
              </div>
            </div>
            <button onClick={handleAdd} className="hover:bg-white/30" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s ease" }}>
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah Penugasan
            </button>
            <button onClick={() => {
              if (data.length === 0) { Swal.fire("Info", "Tidak ada data", "info"); return; }
              exportCSV(
                ["No", "Guru", "Mata Pelajaran", "Kode", "Kelas", "Tahun Ajaran"],
                data.map((d: any, i: number) => [i+1, d.employee?.name, d.subject?.name, d.subject?.code, d.classroom?.name, d.academicYear?.year]),
                "data_penugasan_guru"
              );
            }} className="hover:bg-white/30" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s ease" }}>
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tahun Ajaran</label>
          <select 
            value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="w-full text-sm border-slate-200 rounded-lg bg-slate-50 py-2 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
          >
            <option value="">Semua Tahun Ajaran</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.year} - {y.semester}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter Kelas</label>
          <select 
            value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="w-full text-sm border-slate-200 rounded-lg bg-slate-50 py-2 px-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
          >
            <option value="">Semua Kelas</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <h3 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Penugasan</h3>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1">{data.length}</span>
          </div>
        </div>
        
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
      </div>

      {/* Rekap Beban Mengajar Per Guru */}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="font-heading font-bold text-sm text-slate-800">Rekap Beban Mengajar</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rekapArr.map(r => (
                <div key={r.nama} className="p-3 border border-slate-100 rounded-xl hover:border-amber-200 transition-colors">
                  <p className="font-semibold text-sm text-slate-800">{r.nama}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.jumlahKelas} kelas · {r.mapelSet.size} mapel</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{Array.from(r.mapelSet).join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
