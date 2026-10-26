"use client";
import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { Calendar, Users, History, Save, CheckCircle2, PlusCircle, Loader2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import { ExportButtons } from "@/lib/export-utils";

interface Employee { id: number; name: string; position: string; status: string; }
interface AttendanceRecord { id: number; employeeId: number; date: string; status: string; note: string; employee: Employee; }
interface RecapItem { employeeId: number; name: string; position: string; total: number; hadir: number; sakit: number; izin: number; alpha: number; persen: number; }

export default function EmployeeAttendancePage() {
  const [tab, setTab] = useState<"input" | "rekap">("input");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<{ employeeId: number; status: string; note: string }[]>([]);
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Rekap
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth() + 1);
  const [recapYear, setRecapYear] = useState(new Date().getFullYear());
  const [recap, setRecap] = useState<RecapItem[]>([]);
  const [loadingRecap, setLoadingRecap] = useState(false);

  // State Paginasi
  const [inputMeta, setInputMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [recapMeta, setRecapMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // LeftDrawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEmpId, setDrawerEmpId] = useState<number | "">("");
  const [drawerDate, setDrawerDate] = useState(new Date().toISOString().split("T")[0]);
  const [drawerStatus, setDrawerStatus] = useState("izin");
  const [drawerNote, setDrawerNote] = useState("");
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);

  // Load absensi per tanggal (Input Harian)
  const loadAttendance = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employee-attendance?date=${selectedDate}&page=${page}&limit=${inputMeta.limit}`);
      const result = await res.json();
      
      if (result.success) {
        setExistingRecords(result.data || []);
        setInputMeta(result.pagination);

        const recs = result.data.map((item: AttendanceRecord) => ({
          employeeId: item.employeeId,
          status: item.status || "hadir",
          note: item.note || ""
        }));
        setRecords(recs);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedDate, inputMeta.limit]);

  useEffect(() => {
    if (tab === "input") {
      const fetchInitial = async () => {
        await loadAttendance(1);
      };
      fetchInitial();
    }
  }, [tab, selectedDate, loadAttendance]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/employee-attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, records }),
      });
      Swal.fire({
        title: "Berhasil",
        text: "Absensi pegawai tersimpan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      loadAttendance();
    } catch { 
      Swal.fire("Error", "Gagal menyimpan", "error"); 
    }
    setSaving(false);
  };

  const handleDrawerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerEmpId) {
      Swal.fire("Perhatian", "Pilih pegawai terlebih dahulu", "warning");
      return;
    }
    setDrawerSubmitting(true);
    try {
      const res = await fetch("/api/employee-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: drawerDate,
          records: [{ employeeId: drawerEmpId, status: drawerStatus, note: drawerNote }],
        }),
      });
      if (res.ok) {
        Swal.fire({
          title: "Berhasil",
          text: "Absensi pegawai berhasil dicatat",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setDrawerOpen(false);
        setDrawerNote("");
        if (drawerDate === selectedDate) {
          loadAttendance(inputMeta.page);
        }
      } else {
        Swal.fire("Gagal", "Gagal menyimpan data absensi", "error");
      }
    } catch {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    } finally {
      setDrawerSubmitting(false);
    }
  };

  // Rekap
  const loadRecap = useCallback(async (page: number = 1) => {
    setLoadingRecap(true);
    try {
      const res = await fetch(`/api/employee-attendance/recap?month=${recapMonth}&year=${recapYear}&page=${page}&limit=${recapMeta.limit}`);
      const data = await res.json();
      setRecap(data.recap || []);
      if (data.pagination) setRecapMeta(data.pagination);
    } catch { /* ignore */ }
    setLoadingRecap(false);
  }, [recapMonth, recapYear, recapMeta.limit]);

  useEffect(() => { 
    if (tab === "rekap") {
      const fetchInitialRecap = async () => {
        await loadRecap(1);
      };
      fetchInitialRecap();
    }
  }, [tab, recapMonth, recapYear, loadRecap]);

  const updateRecord = (empId: number, field: "status" | "note", value: string) => {
    setRecords(prev => prev.map(r => r.employeeId === empId ? { ...r, [field]: value } : r));
  };

  const handleBulkSetStatus = (status: string) => {
    setRecords(prev => prev.map(r => selectedEmpIds.includes(r.employeeId) ? { ...r, status } : r));
    Swal.fire({
      title: "Status Diperbarui",
      text: `${selectedEmpIds.length} pegawai diset menjadi ${status.toUpperCase()}`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const statusOpts = ["hadir", "sakit", "izin", "alpha"];
  const statusColors: Record<string, string> = { hadir: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200", sakit: "bg-amber-100 text-amber-700 hover:bg-amber-200", izin: "bg-sky-100 text-sky-700 hover:bg-sky-200", alpha: "bg-rose-100 text-rose-700 hover:bg-rose-200" };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Pegawai"
        subtitle="Kelola kehadiran guru dan staf secara harian dan rekap kehadiran bulanan."
        icon={<div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-blue-500" />}
        actions={
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button 
              onClick={() => setTab("input")} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "input" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Calendar className="w-4 h-4" />
              Input Harian
            </button>
            <button 
              onClick={() => setTab("rekap")} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "rekap" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <History className="w-4 h-4" />
              Rekap Bulanan
            </button>
          </div>
        }
      />

      {tab === "input" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)} 
                  className="pl-9 pr-4 py-2 w-full sm:w-auto border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerDate(selectedDate);
                  setDrawerOpen(true);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Catat Izin / Sakit
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving || !records.length}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Menyimpan...' : 'Simpan Presensi'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600/20 border-t-blue-600 mb-4"></div>
              <p className="text-sm text-slate-500 font-medium">Memuat data pegawai...</p>
            </div>
          ) : existingRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada data</h3>
              <p className="text-slate-500 text-sm max-w-sm text-center">Belum ada data presensi untuk tanggal ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {selectedEmpIds.length > 0 && (
                <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{selectedEmpIds.length} pegawai dipilih</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleBulkSetStatus("hadir")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Set Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetStatus("sakit")}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Set Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetStatus("izin")}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Set Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkSetStatus("alpha")}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      Set Alpha
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEmpIds([])}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
              <table className="w-full text-left bg-white">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={existingRecords.length > 0 && selectedEmpIds.length === existingRecords.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEmpIds(existingRecords.map((item: AttendanceRecord) => item.employee.id));
                          else setSelectedEmpIds([]);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        aria-label="Pilih semua pegawai"
                      />
                    </th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12 text-center">No</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Nama Pegawai</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Status Kehadiran</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {existingRecords.map((item, idx) => {
                    const emp = item.employee;
                    const rec = records.find(r => r.employeeId === emp.id);
                    const isSelected = selectedEmpIds.includes(emp.id);
                    return (
                      <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? "bg-blue-50/40" : ""}`}>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedEmpIds(prev => [...prev, emp.id]);
                              else setSelectedEmpIds(prev => prev.filter(id => id !== emp.id));
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            aria-label={`Pilih ${emp.name}`}
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500 text-center font-mono">{((inputMeta.page - 1) * inputMeta.limit) + idx + 1}</td>
                        <td className="py-3 px-6">
                          <div className="font-medium text-slate-800">{emp.name}</div>
                          <div className="text-xs text-slate-500">{emp.position}</div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {statusOpts.map(s => {
                              const isActive = rec?.status === s;
                              return (
                                <button 
                                  key={s} 
                                  onClick={() => updateRecord(emp.id, "status", s)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${
                                    isActive 
                                      ? statusColors[s] 
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                  }`}
                                >
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <input 
                            value={rec?.note || ""} 
                            onChange={e => updateRecord(emp.id, "note", e.target.value)} 
                            placeholder="Tambahkan catatan..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  page={inputMeta.page}
                  totalPages={inputMeta.totalPages}
                  total={inputMeta.total}
                  limit={inputMeta.limit}
                  onPageChange={(p) => loadAttendance(p)}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === "rekap" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select 
                value={recapMonth} 
                onChange={e => setRecapMonth(parseInt(e.target.value))} 
                className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select 
                value={recapYear} 
                onChange={e => setRecapYear(parseInt(e.target.value))} 
                className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer transition-all appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <ExportButtons 
              options={{
                title: "Rekapitulasi Absensi Pegawai",
                subtitle: `Periode: ${["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][recapMonth-1]} ${recapYear}`,
                filename: `rekap_absensi_pegawai_${recapMonth}_${recapYear}`,
                columns: [
                  { header: "No", key: "_no", width: 10, align: "center" },
                  { header: "Nama Pegawai", key: "name", width: 50 },
                  { header: "Jabatan", key: "position", width: 30 },
                  { header: "Hadir", key: "hadir", width: 15, align: "center" },
                  { header: "Sakit", key: "sakit", width: 15, align: "center" },
                  { header: "Izin", key: "izin", width: 15, align: "center" },
                  { header: "Alpha", key: "alpha", width: 15, align: "center" },
                  { header: "Persen", key: "persen", width: 15, align: "center", format: (v: number | string) => `${v}%` },
                ],
                data: recap.map((r, i) => ({
                  ...r,
                  _no: ((recapMeta.page - 1) * recapMeta.limit) + i + 1
                }))
              }}
            />
          </div>

          {loadingRecap ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600/20 border-t-blue-600 mb-4"></div>
              <p className="text-sm text-slate-500 font-medium">Memuat rekapitulasi...</p>
            </div>
          ) : recap.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum ada rekapitulasi</h3>
              <p className="text-slate-500 text-sm max-w-sm text-center">Data absensi belum tersedia untuk bulan dan tahun yang dipilih.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-12">No</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Pegawai</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jabatan</th>
                    <th className="py-3 px-4 text-xs font-semibold text-emerald-600 uppercase tracking-wider text-center">Hadir</th>
                    <th className="py-3 px-4 text-xs font-semibold text-amber-600 uppercase tracking-wider text-center">Sakit</th>
                    <th className="py-3 px-4 text-xs font-semibold text-sky-600 uppercase tracking-wider text-center">Izin</th>
                    <th className="py-3 px-4 text-xs font-semibold text-rose-600 uppercase tracking-wider text-center">Alpha</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recap.map((r, idx) => (
                    <tr key={r.employeeId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-500 text-center">{((recapMeta.page - 1) * recapMeta.limit) + idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">{r.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">{r.position}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded text-xs font-semibold ${r.hadir > 0 ? "bg-emerald-50 text-emerald-700" : "text-slate-400"}`}>
                          {r.hadir}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded text-xs font-semibold ${r.sakit > 0 ? "bg-amber-50 text-amber-700" : "text-slate-400"}`}>
                          {r.sakit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded text-xs font-semibold ${r.izin > 0 ? "bg-sky-50 text-sky-700" : "text-slate-400"}`}>
                          {r.izin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-8 px-1.5 py-0.5 rounded text-xs font-semibold ${r.alpha > 0 ? "bg-rose-50 text-rose-700" : "text-slate-400"}`}>
                          {r.alpha}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 min-w-8">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${r.persen >= 80 ? "bg-emerald-500" : r.persen >= 60 ? "bg-amber-400" : "bg-rose-500"}`} 
                              style={{ width: `${r.persen}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold w-9 text-right ${r.persen >= 80 ? "text-emerald-700" : r.persen >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                            {r.persen}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  page={recapMeta.page}
                  totalPages={recapMeta.totalPages}
                  total={recapMeta.total}
                  limit={recapMeta.limit}
                  onPageChange={(p) => loadRecap(p)}
                />
              </div>
            </div>
          )}
        </Card>
      )}
      {/* LeftDrawer Catat Izin / Sakit Pegawai */}
      <LeftDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Catat Izin / Sakit Pegawai"
        subtitle="Formulir pengajuan izin tidak hadir, cuti, atau surat sakit"
        width="max-w-md"
      >
        <form onSubmit={handleDrawerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Pegawai <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={drawerEmpId}
              onChange={(e) => setDrawerEmpId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 cursor-pointer"
            >
              <option value="">— Pilih Nama Guru / Staf —</option>
              {existingRecords.map((item) => (
                <option key={item.employee.id} value={item.employee.id}>
                  {item.employee.name} ({item.employee.position || "Pegawai"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tanggal Absensi
            </label>
            <input
              type="date"
              value={drawerDate}
              onChange={(e) => setDrawerDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Status Kehadiran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "sakit", label: "Sakit", color: "border-amber-300 text-amber-700 bg-amber-50/50" },
                { value: "izin", label: "Izin", color: "border-sky-300 text-sky-700 bg-sky-50/50" },
                { value: "alpha", label: "Alpha", color: "border-rose-300 text-rose-700 bg-rose-50/50" },
              ].map((s) => {
                const isSelected = drawerStatus === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setDrawerStatus(s.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? `${s.color} ring-2 ring-blue-500/30 font-bold`
                        : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan / Alasan
            </label>
            <textarea
              rows={3}
              value={drawerNote}
              onChange={(e) => setDrawerNote(e.target.value)}
              placeholder="Contoh: Sakit demam berdarah / Mengikuti pelatihan dinas..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={drawerSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {drawerSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Absensi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}

