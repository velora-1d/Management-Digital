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
  BarChart3
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { generateAttendancePDF } from "@/lib/attendance-report-template";
import { getWhatsAppUrl } from "@/lib/whatsapp";

interface Option {
  id: number;
  name?: string;
  year?: string;
  isActive?: boolean;
  level?: string;
}

type AttendanceStatus = AttendanceRecord["status"];

interface AttendanceApiRow {
  id?: number;
  studentId: number;
  student?: { name: string; nisn: string };
  status: AttendanceStatus;
  note?: string | null;
}

interface ApiErrorLike {
  message?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const maybeError = error as ApiErrorLike;
    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }
  return fallback;
}

interface AttendanceRecord {
  id?: number;
  studentId: number;
  student?: { name: string; nisn: string };
  status: "hadir" | "sakit" | "izin" | "alpha";
  notes: string;
  isNotified?: boolean;
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

export default function AttendancePage({
  initialClassrooms = [],
  initialActiveAY = null
}: {
  initialClassrooms?: Option[];
  initialActiveAY?: Option | null;
}) {
  const [activeTab, setActiveTab] = useState<"input" | "recap">("input");
  
  // Metadata
  const [classrooms] = useState<Option[]>(initialClassrooms);
  const [activeAcademicYear, setActiveAcademicYear] = useState<Option | null>(initialActiveAY);

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

  // Autoselect active year and classroom if available
  useEffect(() => {
    if (initialActiveAY && !activeAcademicYear) {
      setActiveAcademicYear(initialActiveAY);
    }
  }, [initialActiveAY, activeAcademicYear]);

  // --- TAB INPUT ABSENSI ---
  const fetchInputData = useCallback(async () => {
    if (!selectedClassroom || !selectedDate) {
      setAttendances([]);
      return;
    }

    setLoadingInput(true);
    try {
      // Optimasi: Sekali panggil API /api/attendance sudah dapat daftar siswa & statusnya
      const attRes = await fetch(`/api/attendance?classroomId=${selectedClassroom}&date=${selectedDate}`);
      const attJson = await attRes.json();
      
      if (!attJson.success) {
        throw new Error(attJson.error || "Gagal memuat data absensi");
      }

      const rows: AttendanceApiRow[] = Array.isArray(attJson.data) ? attJson.data : [];

      // Format data untuk state
      const formatted: AttendanceRecord[] = rows.map(r => ({
        id: r.id,
        studentId: r.studentId,
        student: r.student,
        status: r.status,
        notes: r.note || ""
      }));

      setAttendances(formatted);
    } catch (error: unknown) {
      Swal.fire("Error", getErrorMessage(error, "Terjadi kesalahan"), "error");
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

  const handleMarkAllPresent = () => {
    setAttendances(prev => prev.map(item => ({ ...item, status: "hadir" })));
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
    } catch (error: unknown) {
      Swal.fire("Error", getErrorMessage(error, "Gagal menyimpan absensi"), "error");
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
    } catch (error: unknown) {
      Swal.fire("Error", getErrorMessage(error, "Koneksi bermasalah"), "error");
    } finally {
      setLoadingRecap(false);
    }
  }, [recapClassroom, recapStartDate, recapEndDate]);

  const handleDownloadRecapPDF = async () => {
    if (recapData.length === 0) return;
    
    try {
      const selectedClass = classrooms.find(c => c.id.toString() === recapClassroom);
      
      const blob = await generateAttendancePDF({
        classroom: { 
          name: selectedClass?.name || "Unknown", 
          level: selectedClass?.level || "-" 
        },
        academicYear: activeAcademicYear?.year || "-",
        startDate: recapStartDate,
        endDate: recapEndDate,
        students: recapData.map(r => ({
          name: r.name,
          nisn: r.nisn,
          stats: r.stats
        })),
        institution: {
          name: "ERP SEKOLAH - VELORA ID",
          address: "Jl. Pendidikan No. 123, Jakarta"
        }
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rekap_absensi_${recapClassroom}_${recapStartDate}.pdf`;
      link.click();
    } catch {
      Swal.fire("Error", "Gagal membuat PDF", "error");
    }
  };

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
                            <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[350px]">
                              <div className="flex items-center justify-between">
                                Kehadiran
                                <button 
                                  onClick={handleMarkAllPresent}
                                  className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                >
                                  Hadirkan Semua
                                </button>
                              </div>
                            </th>
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
                                  {(["hadir", "sakit", "izin", "alpha"] as AttendanceStatus[]).map(statusValue => (
                                    <button
                                      key={statusValue}
                                      onClick={() => handleStatusChange(item.studentId, statusValue)}
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
                          {attendances.length > 0 && attendances.length < 10 && (
                            Array.from({ length: 10 - attendances.length }).map((_, i) => (
                              <tr key={`filler-input-${i}`} style={{ height: "61px" }} className="bg-white">
                                <td className="py-3 px-4 text-sm font-medium text-slate-400 text-center">&nbsp;</td>
                                <td className="py-3 px-4">&nbsp;</td>
                                <td className="py-3 px-4">&nbsp;</td>
                                <td className="py-3 px-4">&nbsp;</td>
                              </tr>
                            ))
                          )}
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

               {/* Mini Dashboard Recap */}
               {recapData.length > 0 && !loadingRecap && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Hadir</div>
                      <div className="text-2xl font-bold text-emerald-800">{recapData.reduce((acc, curr) => acc + curr.stats.hadir, 0)}</div>
                      <div className="text-[10px] text-emerald-500 mt-1">Akumulasi seluruh siswa</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Sakit</div>
                      <div className="text-2xl font-bold text-amber-800">{recapData.reduce((acc, curr) => acc + curr.stats.sakit, 0)}</div>
                      <div className="text-[10px] text-amber-500 mt-1">Butuh perhatian kesehatan</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Izin</div>
                      <div className="text-2xl font-bold text-blue-800">{recapData.reduce((acc, curr) => acc + curr.stats.izin, 0)}</div>
                      <div className="text-[10px] text-blue-500 mt-1">Izin resmi terdata</div>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-rose-600 text-[10px] font-bold uppercase tracking-wider mb-1">Total Alpha</div>
                      <div className="text-2xl font-bold text-rose-800">{recapData.reduce((acc, curr) => acc + curr.stats.alpha, 0)}</div>
                      <div className="text-[10px] text-rose-500 mt-1 font-medium">Potensi drop-out / Bolos</div>
                    </div>
                 </div>
               )}

               {/* Filter Alpha + Export Actions */}
               {recapData.length > 0 && !loadingRecap && (
                 <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                   <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={filterAlpha}
                        onChange={(e) => setFilterAlpha(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 transition-all"
                      />
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-rose-600 transition-colors">Filter Alpha Tinggi</span>
                      {filterAlpha && (
                        <div className="flex items-center gap-1.5 ml-2 px-2 py-1 bg-rose-50 rounded-lg border border-rose-100 animate-in zoom-in-95 duration-200">
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Min:</span>
                          <input
                            type="number"
                            min={1}
                            value={alphaThreshold}
                            onChange={(e) => setAlphaThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 bg-transparent text-center text-xs font-bold text-rose-700 focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Hari</span>
                        </div>
                      )}
                    </label>

                    {filterAlpha && (
                      <button
                        onClick={() => {
                          const highAlpha = recapData.filter(r => r.stats.alpha >= alphaThreshold);
                          if (highAlpha.length === 0) return;
                          Swal.fire({
                            title: 'Kirim Notifikasi WA?',
                            text: `Sistem akan mengirimkan peringatan ke orang tua dari ${highAlpha.length} siswa yang memiliki alpha >= ${alphaThreshold} hari.`,
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Ya, Kirim Sekarang',
                            cancelButtonText: 'Batal',
                            confirmButtonColor: '#25D366'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              const links = highAlpha.map(r => {
                                const msg = `Assalamu'alaikum Ayah/Bunda dari ${r.name}, kami menginformasikan bahwa ananda telah tidak hadir (Alpha) selama ${r.stats.alpha} hari di semester ini. Dimohon perhatiannya. Terima kasih.`;
                                return {
                                  name: r.name,
                                  url: getWhatsAppUrl({ target: "08123456789", message: msg }) // Dummy target for now, real data should have parent phone
                                };
                              });

                              Swal.fire({
                                title: 'Link Notifikasi Siap',
                                html: `
                                  <div class="text-left space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    ${links.map((link, idx) => `
                                      <div class="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 mb-2">
                                        <div class="text-xs font-semibold text-slate-700">${idx+1}. ${link.name}</div>
                                        <a href="${link.url}" target="_blank" class="px-2 py-1 bg-emerald-500 text-white text-[10px] rounded font-bold hover:bg-emerald-600 transition-colors">BUKA WA</a>
                                      </div>
                                    `).join('')}
                                  </div>
                                `,
                                icon: 'info',
                                footer: '<p class="text-[10px] text-slate-400">Klik "BUKA WA" untuk setiap siswa di atas.</p>'
                              });
                            }
                          });
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        KIRIM NOTIFIKASI WA
                      </button>
                    )}
                   </div>

                   <div className="flex items-center gap-2">
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
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200"
                    >
                      <Download className="w-4 h-4" />
                      Excel / CSV
                    </button>
                    <button
                      onClick={handleDownloadRecapPDF}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Cetak Rapor Absensi (PDF)
                    </button>
                   </div>
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
                            {recapDisplayData.length > 0 && recapDisplayData.length < (recapMeta.limit || 10) && (
                              Array.from({ length: (recapMeta.limit || 10) - recapDisplayData.length }).map((_, i) => (
                                <tr key={`filler-recap-${i}`} style={{ height: "61px" }} className="bg-white">
                                  <td className="py-3 px-4 text-sm font-medium text-slate-400 text-center">&nbsp;</td>
                                  <td className="py-3 px-4">&nbsp;</td>
                                  <td className="py-3 px-4 text-center">&nbsp;</td>
                                  <td className="py-3 px-4 text-center">&nbsp;</td>
                                  <td className="py-3 px-4 text-center">&nbsp;</td>
                                  <td className="py-3 px-4 text-center">&nbsp;</td>
                                  <td className="py-3 px-4 text-center bg-blue-50/10">&nbsp;</td>
                                </tr>
                              ))
                            )}
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
