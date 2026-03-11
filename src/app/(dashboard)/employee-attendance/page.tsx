"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Calendar, Download, Save, Users, Clock, History } from "lucide-react";

interface Employee { id: number; name: string; position: string; status: string; }
interface AttendanceRecord { id: number; employeeId: number; date: string; status: string; note: string; employee: Employee; }
interface RecapItem { employeeId: number; name: string; position: string; total: number; hadir: number; sakit: number; izin: number; alpha: number; persen: number; }

export default function EmployeeAttendancePage() {
  const [tab, setTab] = useState<"input" | "rekap">("input");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<{ employeeId: number; status: string; note: string }[]>([]);
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Rekap
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth() + 1);
  const [recapYear, setRecapYear] = useState(new Date().getFullYear());
  const [recap, setRecap] = useState<RecapItem[]>([]);
  const [loadingRecap, setLoadingRecap] = useState(false);

  // Load employees
  useEffect(() => {
    fetch("/api/staff").then(r => r.json()).then(d => {
      const list = (Array.isArray(d) ? d : []).filter((e: Employee) => e.status === "aktif");
      setEmployees(list);
    });
  }, []);

  // Load absensi per tanggal
  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employee-attendance?date=${selectedDate}`);
      const data = await res.json();
      setExistingRecords(Array.isArray(data) ? data : []);

      // Init records
      const recs = employees.map(emp => {
        const existing = (Array.isArray(data) ? data : []).find((a: AttendanceRecord) => a.employeeId === emp.id);
        return { employeeId: emp.id, status: existing?.status || "hadir", note: existing?.note || "" };
      });
      setRecords(recs);
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedDate, employees]);

  useEffect(() => { if (employees.length) loadAttendance(); }, [loadAttendance, employees]);

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

  // Rekap
  const loadRecap = useCallback(async () => {
    setLoadingRecap(true);
    try {
      const res = await fetch(`/api/employee-attendance/recap?month=${recapMonth}&year=${recapYear}`);
      const data = await res.json();
      setRecap(data.recap || []);
    } catch { /* ignore */ }
    setLoadingRecap(false);
  }, [recapMonth, recapYear]);

  useEffect(() => { if (tab === "rekap") loadRecap(); }, [tab, loadRecap]);

  const updateRecord = (empId: number, field: "status" | "note", value: string) => {
    setRecords(prev => prev.map(r => r.employeeId === empId ? { ...r, [field]: value } : r));
  };

  const statusOpts = ["hadir", "sakit", "izin", "alpha"];
  const statusColors: Record<string, string> = { hadir: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200", sakit: "bg-amber-100 text-amber-700 hover:bg-amber-200", izin: "bg-sky-100 text-sky-700 hover:bg-sky-200", alpha: "bg-rose-100 text-rose-700 hover:bg-rose-200" };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi Pegawai"
        subtitle="Kelola kehadiran guru dan staf secara harian dan rekap kehadiran bulanan."
        icon={<Clock className="w-8 h-8 text-indigo-600" />}
        actions={
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button 
              onClick={() => setTab("input")} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "input" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Calendar className="w-4 h-4" />
              Input Harian
            </button>
            <button 
              onClick={() => setTab("rekap")} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "rekap" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
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
                  className="pl-9 pr-4 py-2 w-full sm:w-auto border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hidden sm:inline-flex">
                {existingRecords.length > 0 ? `${existingRecords.length} data tersimpan` : "Belum ada data"}
              </span>
            </div>
            
            <button 
              onClick={handleSave} 
              disabled={saving || !records.length}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Menyimpan...' : 'Simpan Presensi'}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600/20 border-t-indigo-600 mb-4"></div>
              <p className="text-sm text-slate-500 font-medium">Memuat data pegawai...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada pegawai aktif</h3>
              <p className="text-slate-500 text-sm max-w-sm text-center">Belum ada data pegawai yang aktif untuk dilakukan pendataan presensi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12 text-center">No</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Nama Pegawai</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Status Kehadiran</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp, idx) => {
                    const rec = records.find(r => r.employeeId === emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3 px-6 text-sm text-slate-500 text-center">{idx + 1}</td>
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
                            placeholder="Tambahkan catatan jika ada..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer transition-all appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select 
                value={recapYear} 
                onChange={e => setRecapYear(parseInt(e.target.value))} 
                className="border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer transition-all appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
              >
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => {
                if (!recap.length) return;
                exportCSV(["No", "Nama", "Jabatan", "Hadir", "Sakit", "Izin", "Alpha", "Total", "%"],
                  recap.map((r, i) => [i + 1, r.name, r.position, r.hadir, r.sakit, r.izin, r.alpha, r.total, r.persen]), `rekap_absensi_pegawai_${recapMonth}_${recapYear}`);
              }} 
              disabled={!recap.length}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export CSV
            </button>
          </div>

          {loadingRecap ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600/20 border-t-indigo-600 mb-4"></div>
              <p className="text-sm text-slate-500 font-medium">Memuat rekapitulasi...</p>
            </div>
          ) : recap.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum ada rekapitulasi</h3>
              <p className="text-slate-500 text-sm max-w-sm text-center">Data absensi belum tersedia untuk bulan dan tahun yang diplih.</p>
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
                      <td className="py-3 px-4 text-sm text-slate-500 text-center">{idx + 1}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">{r.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">{r.position}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded text-xs font-semibold ${r.hadir > 0 ? "bg-emerald-50 text-emerald-700" : "text-slate-400"}`}>
                          {r.hadir}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded text-xs font-semibold ${r.sakit > 0 ? "bg-amber-50 text-amber-700" : "text-slate-400"}`}>
                          {r.sakit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded text-xs font-semibold ${r.izin > 0 ? "bg-sky-50 text-sky-700" : "text-slate-400"}`}>
                          {r.izin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded text-xs font-semibold ${r.alpha > 0 ? "bg-rose-50 text-rose-700" : "text-slate-400"}`}>
                          {r.alpha}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
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
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

