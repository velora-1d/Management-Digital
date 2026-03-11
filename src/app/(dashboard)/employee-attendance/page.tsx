"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

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
      Swal.fire("Berhasil", "Absensi pegawai tersimpan", "success");
      loadAttendance();
    } catch { Swal.fire("Error", "Gagal menyimpan", "error"); }
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
  const statusColors: Record<string, string> = { hadir: "bg-emerald-100 text-emerald-700", sakit: "bg-amber-100 text-amber-700", izin: "bg-sky-100 text-sky-700", alpha: "bg-rose-100 text-rose-700" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Absensi Pegawai</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola kehadiran guru dan staf</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 flex gap-1 max-w-xs">
        <button onClick={() => setTab("input")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "input" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Input Harian</button>
        <button onClick={() => setTab("rekap")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "rekap" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Rekap Bulanan</button>
      </div>

      {tab === "input" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <span className="text-xs text-slate-400">{existingRecords.length > 0 ? `${existingRecords.length} data tersimpan` : "Belum ada data"}</span>
            </div>
            <button onClick={handleSave} disabled={saving || !records.length}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              Simpan Semua
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">Tidak ada pegawai aktif</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-3">No</th><th className="py-3 px-3">Nama</th><th className="py-3 px-3">Jabatan</th><th className="py-3 px-3">Status</th><th className="py-3 px-3">Keterangan</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((emp, idx) => {
                    const rec = records.find(r => r.employeeId === emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 text-xs text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-sm font-medium text-slate-800">{emp.name}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-500">{emp.position}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex gap-1">
                            {statusOpts.map(s => (
                              <button key={s} onClick={() => updateRecord(emp.id, "status", s)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${rec?.status === s ? statusColors[s] : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <input value={rec?.note || ""} onChange={e => updateRecord(emp.id, "note", e.target.value)} placeholder="Opsional"
                            className="w-full border border-slate-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "rekap" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select value={recapMonth} onChange={e => setRecapMonth(parseInt(e.target.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select value={recapYear} onChange={e => setRecapYear(parseInt(e.target.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={() => {
              if (!recap.length) return;
              exportCSV(["No", "Nama", "Jabatan", "Hadir", "Sakit", "Izin", "Alpha", "Total", "%"],
                recap.map((r, i) => [i + 1, r.name, r.position, r.hadir, r.sakit, r.izin, r.alpha, r.total, r.persen]), `rekap_absensi_pegawai_${recapMonth}_${recapYear}`);
            }} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>

          {loadingRecap ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : recap.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">Belum ada data rekap</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-3">No</th><th className="py-3 px-3">Nama</th><th className="py-3 px-3">Jabatan</th>
                  <th className="py-3 px-3 text-center">Hadir</th><th className="py-3 px-3 text-center">Sakit</th>
                  <th className="py-3 px-3 text-center">Izin</th><th className="py-3 px-3 text-center">Alpha</th>
                  <th className="py-3 px-3 text-center">%</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {recap.map((r, idx) => (
                    <tr key={r.employeeId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-xs text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-sm font-medium text-slate-800">{r.name}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">{r.position}</td>
                      <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">{r.hadir}</span></td>
                      <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-semibold">{r.sakit}</span></td>
                      <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-xs font-semibold">{r.izin}</span></td>
                      <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-semibold">{r.alpha}</span></td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${r.persen >= 80 ? "bg-emerald-500" : r.persen >= 60 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${r.persen}%` }}></div></div>
                          <span className="text-xs font-semibold text-slate-700">{r.persen}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
