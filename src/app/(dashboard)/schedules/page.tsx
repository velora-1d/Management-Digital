"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

interface Schedule {
  id: number;
  classroomId: number;
  classroom: { name: string };
  subjectId: number;
  subject: { name: string; code: string };
  employeeId: number;
  employee: { name: string };
  academicYearId: number;
  academicYear: { year: string; isActive: boolean };
  day: number;
  startTime: string;
  endTime: string;
}

interface Option {
  id: number;
  name?: string;
  year?: string;
  isActive?: boolean;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");

  // Metadata
  const [classrooms, setClassrooms] = useState<Option[]>([]);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);

  // Format array untuk grid (Hari 1-6 Senin-Sabtu)
  const days = [
    { id: 1, name: "Senin" },
    { id: 2, name: "Selasa" },
    { id: 3, name: "Rabu" },
    { id: 4, name: "Kamis" },
    { id: 5, name: "Jumat" },
    { id: 6, name: "Sabtu" }
  ];

  const fetchMetadata = async () => {
    try {
      // Dalam implementasi nyata, kita fetch dari masing-masing API.
      // Untuk efisiensi, asumsikan API masing-masing mereturn semua data tanpa pagination
      const [crRes, ayRes, subRes, empRes] = await Promise.all([
        fetch("/api/classrooms").then(r => r.json()),
        fetch("/api/academic-years").then(r => r.json()),
        fetch("/api/subjects").then(r => r.json()),
        fetch("/api/teachers").then(r => r.json()), // Gunakan teachers endpoint
      ]);

      if (crRes.success) setClassrooms(crRes.data || []);
      if (ayRes.success) {
        setAcademicYears(ayRes.data || []);
        // Autoselect active
        const active = ayRes.data.find((a: any) => a.isActive);
        if (active) setSelectedAcademicYear(active.id.toString());
      }
      if (subRes.success) setSubjects(subRes.data || []);
      if (empRes.success) setEmployees(empRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil metadata", error);
    }
  };

  const fetchSchedules = useCallback(async () => {
    if (!selectedClassroom || !selectedAcademicYear) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (selectedClassroom) qs.append("classroomId", selectedClassroom);
      if (selectedAcademicYear) qs.append("academicYearId", selectedAcademicYear);

      const res = await fetch(`/api/schedules?${qs.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data);
      } else {
        Swal.fire("Error", json.error || "Gagal mengambil data", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedClassroom, selectedAcademicYear]);

  // Deteksi bentrok: guru yang sama mengajar di hari dan jam yang tumpang tindih
  const conflicts = useMemo(() => {
    const found: { schedA: Schedule; schedB: Schedule }[] = [];
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i];
        const b = schedules[j];
        if (a.employeeId === b.employeeId && a.day === b.day) {
          // Cek tumpang tindih waktu
          if (a.startTime < b.endTime && b.startTime < a.endTime) {
            found.push({ schedA: a, schedB: b });
          }
        }
      }
    }
    return found;
  }, [schedules]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleCreate = () => {
    if (!selectedClassroom || !selectedAcademicYear) {
      Swal.fire("Peringatan", "Pilih Tahun Ajaran dan Kelas terlebih dahulu", "warning");
      return;
    }

    const subjectOptions = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    const employeeOptions = employees.map(e => `<option value="${e.id}">${e.name}</option>`).join("");
    const dayOptions = days.map(d => `<option value="${d.id}">${d.name}</option>`).join("");

    Swal.fire({
      title: "Tambah Jadwal Pelajaran",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran <span class="text-red-500">*</span></label>
            <select id="swal-subject" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
              <option value="">-- Pilih Mapel --</option>
              ${subjectOptions}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Guru Pengajar <span class="text-red-500">*</span></label>
            <select id="swal-employee" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
              <option value="">-- Pilih Guru --</option>
              ${employeeOptions}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hari <span class="text-red-500">*</span></label>
            <select id="swal-day" class="w-full border-gray-300 rounded-md shadow-sm p-2 border">
              ${dayOptions}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jam Mulai <span class="text-red-500">*</span></label>
              <input id="swal-startTime" type="time" class="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jam Selesai <span class="text-red-500">*</span></label>
              <input id="swal-endTime" type="time" class="w-full border-gray-300 rounded-md shadow-sm p-2 border" />
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const subjectId = (document.getElementById("swal-subject") as HTMLSelectElement).value;
        const employeeId = (document.getElementById("swal-employee") as HTMLSelectElement).value;
        const day = (document.getElementById("swal-day") as HTMLSelectElement).value;
        const startTime = (document.getElementById("swal-startTime") as HTMLInputElement).value;
        const endTime = (document.getElementById("swal-endTime") as HTMLInputElement).value;

        if (!subjectId || !employeeId || !day || !startTime || !endTime) {
          Swal.showValidationMessage("Semua field wajib diisi");
          return false;
        }

        return {
          classroomId: selectedClassroom,
          academicYearId: selectedAcademicYear,
          subjectId,
          employeeId,
          day,
          startTime,
          endTime
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch("/api/schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value),
          });
          const data = await res.json();

          if (data.success) {
            Swal.fire("Berhasil", "Jadwal berhasil ditambahkan", "success");
            fetchSchedules();
          } else {
            Swal.fire("Gagal", data.error, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus Jadwal?",
      text: "Data jadwal akan dihapus dari sistem",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
          Swal.fire("Terhapus!", "Jadwal berhasil dihapus", "success");
          fetchSchedules();
        } else {
          Swal.fire("Gagal", data.error, "error");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  // Helper untuk render grid
  const getSchedulesByDay = (dayId: number) => {
    return schedules.filter(s => s.day === dayId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Pelajaran</h1>
          <p className="text-gray-600 text-sm mt-1">Manajemen jadwal pelajaran per kelas</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!selectedClassroom || !selectedAcademicYear}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jadwal
        </button>
        <button
          onClick={() => {
            if (schedules.length === 0) { Swal.fire("Info", "Tidak ada data jadwal", "info"); return; }
            const dayNames: Record<number,string> = {1:"Senin",2:"Selasa",3:"Rabu",4:"Kamis",5:"Jumat",6:"Sabtu"};
            exportCSV(
              ["No", "Hari", "Jam Mulai", "Jam Selesai", "Mata Pelajaran", "Guru"],
              schedules.map((s, i) => [i+1, dayNames[s.day] || s.day, s.startTime, s.endTime, s.subject.name, s.employee.name]),
              `jadwal_${classrooms.find(c => c.id.toString() === selectedClassroom)?.name || "kelas"}`
            );
          }}
          disabled={!selectedClassroom || !selectedAcademicYear || schedules.length === 0}
          className="mt-4 md:mt-0 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Pilih Tahun Ajaran...</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>{ay.year} - {ay.isActive ? 'Aktif' : 'Tidak Aktif'}</option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Pilih Kelas --</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedClassroom || !selectedAcademicYear ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Pilih Tahun Ajaran dan Kelas</h3>
          <p className="mt-1 text-sm text-gray-500">Silakan tentukan filter di atas untuk melihat atau mengatur jadwal.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Banner Peringatan Bentrok */}
          {conflicts.length > 0 && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <h4 className="font-bold text-sm text-rose-700">⚠ Terdeteksi {conflicts.length} Bentrok Jadwal</h4>
              </div>
              <ul className="space-y-1">
                {conflicts.map((c, i) => (
                  <li key={i} className="text-xs text-rose-600">
                    <strong>{c.schedA.employee.name}</strong> bentrok: {c.schedA.subject.name} ({c.schedA.startTime}-{c.schedA.endTime}) vs {c.schedB.subject.name} ({c.schedB.startTime}-{c.schedB.endTime})
                  </li>
                ))}
              </ul>
            </div>
          )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day) => (
            <div key={day.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-semibold text-gray-700">
                {day.name}
              </div>
              <div className="p-4 space-y-3">
                {getSchedulesByDay(day.id).length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">Tidak ada jadwal</p>
                ) : (
                  getSchedulesByDay(day.id).map((sched) => (
                    <div key={sched.id} className="relative group border border-gray-100 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {sched.startTime} - {sched.endTime}
                        </span>
                        <button
                          onClick={() => handleDelete(sched.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus Jadwal"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="font-semibold text-gray-900 mt-2">{sched.subject.name}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {sched.employee.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
