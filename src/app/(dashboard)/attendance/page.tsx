"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { 
  Users, 
  Calendar, 
  Save, 
  Search, 
  Download,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Pagination from "@/components/Pagination";

interface Option {
  id: number;
  name?: string;
  year?: string;
  isActive?: boolean;
}

interface Student {
  id: number;
  nisn: string;
  name: string;
}

interface AttendanceRecord {
  id?: number;
  studentId: number;
  student?: { name: string; nisn: string };
  status: "hadir" | "sakit" | "izin" | "alpha";
  notes: string;
}

interface RecapRecord {
  id: number;
  nisn: string;
  name: string;
  stats: {
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
  };
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"input" | "recap">("input");
  
  // Metadata
  const [classrooms, setClassrooms] = useState<Option[]>([]);
  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState<Option | null>(null);

  // Filters Input
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  
  // State Input
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loadingInput, setLoadingInput] = useState(false);
  const [savingInput, setSavingInput] = useState(false);

  // Filters Recap
  const [recapClassroom, setRecapClassroom] = useState("");
  const [recapStartDate, setRecapStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [recapEndDate, setRecapEndDate] = useState(new Date().toISOString().split("T")[0]);
  
  // State Recap
  const [recapData, setRecapData] = useState<RecapRecord[]>([]);
  const [recapMeta, setRecapMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [filterAlpha, setFilterAlpha] = useState(false);
  const [alphaThreshold, setAlphaThreshold] = useState(3);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [crRes, ayRes] = await Promise.all([
        fetch("/api/classrooms").then(r => r.json()),
        fetch("/api/academic-years").then(r => r.json()),
      ]);

      if (crRes.success && Array.isArray(crRes.data)) setClassrooms(crRes.data);
      else setClassrooms([]);

      if (ayRes.success && Array.isArray(ayRes.data)) {
        setAcademicYears(ayRes.data);
        const active = ayRes.data.find((a: any) => a.isActive);
        if (active) setActiveAcademicYear(active);
      } else {
        setAcademicYears([]);
      }
    } catch (error) {
      console.error("Gagal mengambil metadata", error);
    }
  };

  // --- TAB INPUT ABSENSI ---
  const fetchInputData = useCallback(async () => {
    if (!selectedClassroom || !selectedDate) {
      setAttendances([]);
      return;
    }

    setLoadingInput(true);
    try {
      // 1. Ambil murid di kelas target
      const muridRes = await fetch(`/api/students?classroomId=${selectedClassroom}`);
      const muridJson = await muridRes.json();
      
      if (!muridJson.success) {
        throw new Error(muridJson.error || "Gagal memuat siswa");
      }

      const students: Student[] = muridJson.data || [];

      // 2. Ambil absensi hari tersebut di kelas tsb
      const attRes = await fetch(`/api/attendance?classroomId=${selectedClassroom}&date=${selectedDate}`);
      const attJson = await attRes.json();
      const existingAtts = (attJson.data || []) as any[];

      // 3. Merge data
      const merged: AttendanceRecord[] = students.map(student => {
        const exist = existingAtts.find(a => a.studentId === student.id);
        return {
          id: exist?.id,
          studentId: student.id,
          student: { name: student.name, nisn: student.nisn },
          status: exist?.status || "hadir",
          notes: exist?.note || ""
        };
      });

      setAttendances(merged);
    } catch (error: any) {
      Swal.fire("Error", error.message || "Terjadi kesalahan", "error");
    } finally {
      setLoadingInput(false);
    }
  }, [selectedClassroom, selectedDate]);

  useEffect(() => {
    if (activeTab === "input") {
      fetchInputData();
    }
  }, [fetchInputData, activeTab]);

  const handleStatusChange = (studentId: number, status: "hadir" | "sakit" | "izin" | "alpha") => {
    setAttendances(prev => 
      prev.map(item => item.studentId === studentId ? { ...item, status } : item)
    );
  };

  const handleNoteChange = (studentId: number, notes: string) => {
    setAttendances(prev => 
      prev.map(item => item.studentId === studentId ? { ...item, notes } : item)
    );
  };

  const handleSaveInput = async () => {
    if (!selectedClassroom || !activeAcademicYear || !selectedDate) {
      Swal.fire("Peringatan", "Mohon lengkapi kelas dan tanggal", "warning");
      return;
    }

    setSavingInput(true);
    try {
      const payload = {
        classroomId: selectedClassroom,
        academicYearId: activeAcademicYear.id,
        date: selectedDate,
        attendances: attendances.map(a => ({
          studentId: a.studentId,
          status: a.status,
          notes: a.notes
        }))
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        Swal.fire("Berhasil", "Data absensi berhasil disimpan", "success");
        fetchInputData(); // Refresh untuk mendapatkan id db yang baru
      } else {
        Swal.fire("Gagal", json.error || "Gagal menyimpan", "error");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Gagal menyimpan absensi", "error");
    } finally {
      setSavingInput(false);
    }
  };

  // --- TAB REKAP ABSENSI ---
  const fetchRecapData = useCallback(async (page: number = 1) => {
    if (!recapClassroom || !recapStartDate || !recapEndDate) {
      Swal.fire("Peringatan", "Mohon lengkapi parameter filter rekap", "warning");
      return;
    }

    setLoadingRecap(true);
    try {
      const qs = new URLSearchParams({
        classroomId: recapClassroom,
        startDate: recapStartDate,
        endDate: recapEndDate,
        page: page.toString(),
        limit: "10"
      });

      const res = await fetch(`/api/attendance/recap?${qs.toString()}`);
      const json = await res.json();

      if (json.success) {
        setRecapData(json.data);
        if (json.meta) setRecapMeta(json.meta);
      } else {
        Swal.fire("Error", json.error || "Gagal mengambil rekap", "error");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Koneksi bermasalah", "error");
    } finally {
      setLoadingRecap(false);
    }
  }, [recapClassroom, recapStartDate, recapEndDate]);

  // View Renderers
  const recapDisplayData = filterAlpha 
    ? recapData.filter(r => r.stats.alpha >= alphaThreshold) 
    : recapData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Siswa"
        subtitle="Kelola data kehadiran harian dan cetak rekapitulasi absensi siswa."
        icon={<ClipboardList className="w-5 h-5 text-indigo-600" />}
        actions={
          activeAcademicYear && (
            <div className="bg-white/60 backdrop-blur-sm border px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-sm border-slate-200">
              T.A Aktif: <span className="text-indigo-600 ml-1">{activeAcademicYear.year}</span>
            </div>
          )
        }
      />

      {/* Navigation Card */}
      <Card compact>
        <div className="flex p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
          <button
            onClick={() => setActiveTab("input")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "input"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Input Absensi
          </button>
          <button
            onClick={() => setActiveTab("recap")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "recap"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Rekapitulasi
          </button>
        </div>
      </Card>

      <Card noPadding>
        <div className="p-6">
          {/* CONTENT INPUT ABSENSI */}
          {activeTab === "input" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Kelas</label>
                  <select
                    className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                  >
                    <option value="">Pilih Kelas...</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id.toString()}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Tanggal</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loadingInput ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedClassroom ? (
                attendances.length > 0 ? (
                  <>
                    <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">No</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Nama Siswa</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[350px]">Kehadiran</th>
                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendances.map((item, index) => (
                            <tr key={item.studentId} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="py-3 px-4 text-sm font-medium text-slate-400 text-center">{index + 1}</td>
                              <td className="py-3 px-4">
                                <div className="text-sm font-semibold text-slate-800">{item.student?.name}</div>
                                <div className="text-xs text-slate-500">NISN: {item.student?.nisn || "-"}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {["hadir", "sakit", "izin", "alpha"].map(statusValue => (
                                    <button
                                      key={statusValue}
                                      onClick={() => handleStatusChange(item.studentId, statusValue as any)}
                                      className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors border ${
                                        item.status === statusValue 
                                          ? (statusValue === "hadir" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                             statusValue === "sakit" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                             statusValue === "izin" ? "bg-blue-100 text-blue-700 border-blue-200" :
                                             "bg-rose-100 text-rose-700 border-rose-200")
                                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                      }`}
                                    >
                                      {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  placeholder="Opsional"
                                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                  value={item.notes}
                                  onChange={(e) => handleNoteChange(item.studentId, e.target.value)}
                                  // Auto focus styling
                                  onFocus={(e) => e.target.parentElement?.parentElement?.classList.add('bg-blue-50/30')}
                                  onBlur={(e) => e.target.parentElement?.parentElement?.classList.remove('bg-blue-50/30')}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                        onClick={handleSaveInput}
                        disabled={savingInput}
                      >
                        {savingInput ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Simpan Absensi
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-semibold mb-1 relative z-10">Data Murid Kosong</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto relative z-10">
                      Tidak ada murid yang terdaftar di kelas ini, atau data belum dimuat secara komplit. Pilihlah kelas yang memiliki murid.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-16 px-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-800 font-semibold mb-1 relative z-10">Pilih Kelas</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto relative z-10">
                    Silakan pilih kelas terlebih dahulu untuk mulai mengisi absensi siswa pada tanggal spesifik.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CONTENT REKAP ABSENSI */}
          {activeTab === "recap" && (
             <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-full sm:w-56">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Kelas</label>
                    <select
                      className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={recapClassroom}
                      onChange={(e) => setRecapClassroom(e.target.value)}
                    >
                      <option value="">Pilih ...</option>
                      {classrooms.map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Dari Tanggal</label>
                    <input
                      type="date"
                      className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={recapStartDate}
                      onChange={(e) => setRecapStartDate(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Sampai Tanggal</label>
                    <input
                      type="date"
                      className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={recapEndDate}
                      onChange={(e) => setRecapEndDate(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => fetchRecapData(1)}
                    disabled={loadingRecap}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loadingRecap ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    ) : (
                       <Search className="w-4 h-4" />
                    )}
                    Tampilkan
                  </button>
               </div>

               {/* Filter Alpha + Export CSV */}
               {recapData.length > 0 && !loadingRecap && (
                 <div className="flex flex-wrap items-center justify-between gap-4">
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                     <input
                       type="checkbox"
                       checked={filterAlpha}
                       onChange={(e) => setFilterAlpha(e.target.checked)}
                       className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                     />
                     <span className="text-sm font-medium text-slate-700">Hanya tampilkan siswa Alpha tinggi</span>
                     {filterAlpha && (
                       <span className="flex items-center gap-1 text-xs text-slate-500">
                         ≥
                         <input
                           type="number"
                           min={1}
                           value={alphaThreshold}
                           onChange={(e) => setAlphaThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                           className="w-12 px-1 py-0.5 text-center text-xs border border-slate-300 rounded focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none"
                         />
                         hari
                       </span>
                     )}
                   </label>
                   <button
                     onClick={() => {
                       const filtered = filterAlpha ? recapData.filter(r => r.stats.alpha >= alphaThreshold) : recapData;
                       if (filtered.length === 0) { Swal.fire("Info", "Tidak ada data", "info"); return; }
                       exportCSV(
                         ["No", "NISN", "Nama Siswa", "Hadir", "Sakit", "Izin", "Alpha", "Total Hari"],
                         filtered.map((r, i) => [i+1, r.nisn, r.name, r.stats.hadir, r.stats.sakit, r.stats.izin, r.stats.alpha, r.stats.total]),
                         "rekap_absensi"
                       );
                     }}
                     className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                   >
                     <Download className="w-4 h-4" />
                     Export CSV
                   </button>
                 </div>
               )}

               {recapData.length > 0 && !loadingRecap && (
                  recapDisplayData.length > 0 ? (
                    <>
                      <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">No</th>
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Nama Siswa</th>
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Hadir</th>
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Sakit</th>
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Izin</th>
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Alpha</th>
                              <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center bg-blue-50">Total Hari</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {recapDisplayData.map((item, index) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium text-slate-400 text-center">{((recapMeta.page - 1) * recapMeta.limit) + index + 1}</td>
                                <td className="py-3 px-4">
                                  <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                                  <div className="text-xs text-slate-500">{item.nisn}</div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm">
                                    {item.stats.hadir}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-semibold text-sm">
                                    {item.stats.sakit}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
                                    {item.stats.izin}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                                    item.stats.alpha > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-50 text-slate-500"
                                  }`}>
                                    {item.stats.alpha}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center bg-blue-50/30">
                                  <span className="font-bold text-blue-800 text-sm">
                                    {item.stats.total}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4">
                        <Pagination
                          page={recapMeta.page}
                          totalPages={recapMeta.totalPages}
                          total={recapMeta.total}
                          limit={recapMeta.limit}
                          onPageChange={(p) => fetchRecapData(p)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      <p className="text-sm text-slate-500">Tidak ada siswa dengan alpha ≥ {alphaThreshold} hari.</p>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
