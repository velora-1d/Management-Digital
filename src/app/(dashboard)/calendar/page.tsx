"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";

interface CalendarEvent {
  id: number; title: string; dateStart: string; dateEnd: string;
  type: string; color: string; academicYearId: number | null;
  academicYear?: { id: number; year: string };
}

const typeOptions = [
  { value: "kegiatan", label: "Kegiatan", color: "#3b82f6" },
  { value: "ujian", label: "Ujian", color: "#ef4444" },
  { value: "libur", label: "Libur", color: "#22c55e" },
];

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CalendarEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({ title: "", dateStart: "", dateEnd: "", type: "kegiatan", color: "#3b82f6" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/calendar?";
      if (filterType) url += `type=${filterType}&`;
      const res = await fetch(url);
      const d = await res.json();
      setEvents(Array.isArray(d) ? d : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.title || !form.dateStart) { Swal.fire("Error", "Judul dan tanggal wajib", "error"); return; }
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `/api/calendar/${editItem.id}` : "/api/calendar";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setEditItem(null);
    setForm({ title: "", dateStart: "", dateEnd: "", type: "kegiatan", color: "#3b82f6" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Event diperbarui" : "Event ditambahkan", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ title: "Hapus event?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (!r.isConfirmed) return;
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: CalendarEvent) => {
    setEditItem(item);
    setForm({ title: item.title, dateStart: item.dateStart, dateEnd: item.dateEnd, type: item.type, color: item.color });
    setShowModal(true);
  };

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: { day: number; events: CalendarEvent[] }[] = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, events: [] });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayEvents = events.filter(e => e.dateStart <= dateStr && e.dateEnd >= dateStr);
      days.push({ day: d, events: dayEvents });
    }
    return days;
  }, [currentYear, currentMonth, events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events.filter(e => e.dateStart >= today).slice(0, 8);
  }, [events]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Kalender Akademik</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola jadwal kegiatan, ujian, dan hari libur</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ title: "", dateStart: "", dateEnd: "", type: "kegiatan", color: "#3b82f6" }); setShowModal(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Tambah Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-lg font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setFilterType("")} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!filterType ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Semua</button>
            {typeOptions.map(t => (
              <button key={t.value} onClick={() => setFilterType(t.value)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${filterType === t.value ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>{t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
              {dayNames.map(d => <div key={d} className="bg-slate-50 text-center py-2 text-[11px] font-semibold text-slate-500 uppercase">{d}</div>)}
              {calendarDays.map((cell, idx) => (
                <div key={idx} className={`bg-white min-h-[80px] p-1.5 ${cell.day === 0 ? "bg-slate-50/50" : "hover:bg-indigo-50/30"} transition-colors`}>
                  {cell.day > 0 && (
                    <>
                      <span className={`text-xs font-medium ${
                        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}` === new Date().toISOString().split("T")[0]
                          ? "w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center" : "text-slate-600"
                      }`}>{cell.day}</span>
                      <div className="mt-1 space-y-0.5">
                        {cell.events.slice(0, 2).map(ev => (
                          <div key={ev.id} onClick={() => handleEdit(ev)} className="px-1 py-0.5 rounded text-[9px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: ev.color + "20", color: ev.color }}>
                            {ev.title}
                          </div>
                        ))}
                        {cell.events.length > 2 && <span className="text-[9px] text-slate-400">+{cell.events.length - 2} lainnya</span>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <h3 className="font-heading font-bold text-sm text-slate-800">Event Mendatang</h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Tidak ada event mendatang</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="p-2.5 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors cursor-pointer group" onClick={() => handleEdit(ev)}>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ev.color }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{ev.title}</p>
                      <p className="text-[11px] text-slate-400">{ev.dateStart}{ev.dateEnd !== ev.dateStart ? ` — ${ev.dateEnd}` : ""}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Event" : "Tambah Event"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-600">Judul Event *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-600">Tanggal Mulai *</label>
                  <input type="date" value={form.dateStart} onChange={e => setForm({ ...form, dateStart: e.target.value, dateEnd: form.dateEnd || e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="text-xs font-semibold text-slate-600">Tanggal Selesai</label>
                  <input type="date" value={form.dateEnd} onChange={e => setForm({ ...form, dateEnd: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-600">Jenis</label>
                  <select value={form.type} onChange={e => {
                    const opt = typeOptions.find(t => t.value === e.target.value);
                    setForm({ ...form, type: e.target.value, color: opt?.color || form.color });
                  }} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-slate-600">Warna</label>
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full mt-1 h-10 rounded-lg border border-slate-200 cursor-pointer" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Batal</button>
              {editItem && <button onClick={() => { handleDelete(editItem.id); setShowModal(false); }} className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-medium transition-colors">Hapus</button>}
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
