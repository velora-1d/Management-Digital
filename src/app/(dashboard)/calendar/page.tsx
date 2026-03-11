"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  LayoutGrid
} from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
  type: string;
  color: string;
  academicYearId: number | null;
  academicYear?: { id: number; year: string };
  location?: string;
  description?: string;
  targetAudience?: string;
}

const typeOptions = [
  { value: "kegiatan", label: "Kegiatan", color: "#6366f1" },
  { value: "ujian", label: "Ujian", color: "#f59e0b" },
  { value: "libur", label: "Libur", color: "#ef4444" },
];

const typeColors: Record<string, string> = { 
  kegiatan: "bg-indigo-50 text-indigo-600 border-indigo-100", 
  ujian: "bg-amber-50 text-amber-600 border-amber-100", 
  libur: "bg-rose-50 text-rose-600 border-rose-100", 
  rapat: "bg-emerald-50 text-emerald-600 border-emerald-100", 
  lainnya: "bg-slate-50 text-slate-600 border-slate-100" 
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CalendarEvent | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({ title: "", dateStart: "", dateEnd: "", type: "kegiatan", color: "#6366f1", location: "", description: "", targetAudience: "" });

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
    setForm({ title: "", dateStart: "", dateEnd: "", type: "kegiatan", color: "#6366f1", location: "", description: "", targetAudience: "" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Event diperbarui" : "Event ditambahkan", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ 
      title: "Hapus event?", 
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    });
    if (!r.isConfirmed) return;
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    fetchData();
    Swal.fire("Berhasil", "Event telah dihapus", "success");
  };

  const handleEdit = (item: CalendarEvent) => {
    setEditItem(item);
    setForm({ 
      title: item.title, 
      dateStart: item.dateStart, 
      dateEnd: item.dateEnd || item.dateStart, 
      type: item.type, 
      color: item.color,
      location: item.location || "",
      description: item.description || "",
      targetAudience: item.targetAudience || ""
    });
    setShowModal(true);
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: { day: number; events: CalendarEvent[] }[] = [];

    for (let i = 0; i < firstDay; i++) days.push({ day: 0, events: [] });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayEvents = events.filter(e => e.dateStart <= dateStr && (e.dateEnd || e.dateStart) >= dateStr);
      days.push({ day: d, events: dayEvents });
    }
    return days;
  }, [currentYear, currentMonth, events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events.filter(e => e.dateStart >= today).slice(0, 8);
  }, [events]);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

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
      <PageHeader 
        title="Kalender Akademik" 
        subtitle="Kelola jadwal kegiatan, ujian, dan hari libur sekolah"
        icon={<CalendarIcon />}
        actions={
          <button 
            onClick={() => { setEditItem(null); setForm({ title: "", dateStart: "", dateEnd: "", type: "kegiatan", color: "#6366f1", location: "", description: "", targetAudience: "" }); setShowModal(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Event
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Card */}
        <Card noPadding className="lg:col-span-3 overflow-hidden border-none shadow-sm">
          <div className="p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-indigo-500" />
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)} 
                  className="bg-slate-50 border-none rounded-xl py-2 pl-9 pr-8 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">SEMUA TIPE</option>
                  {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
              {dayNames.map(d => (
                <div key={d} className="bg-slate-50 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
              ))}
              {calendarDays.map((cell, idx) => (
                <div key={idx} className={`bg-white min-h-[90px] md:min-h-[120px] p-2 border-t border-slate-50 ${cell.day === 0 ? "bg-slate-50/30" : "hover:bg-slate-50/50"} transition-colors relative`}>
                  {cell.day > 0 && (
                    <>
                      <span className={`text-xs font-bold ${
                        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}` === new Date().toISOString().split("T")[0]
                          ? "w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100" : "text-slate-400"
                      }`}>{cell.day}</span>
                      <div className="mt-2 space-y-1">
                        {cell.events.slice(0, 3).map(ev => (
                          <div 
                            key={ev.id} 
                            onClick={() => handleEdit(ev)} 
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold truncate cursor-pointer transition-all border ${typeColors[ev.type] || "bg-slate-100 text-slate-600"}`}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {cell.events.length > 3 && (
                          <div className="text-[8px] font-bold text-slate-400 ml-1">
                            +{cell.events.length - 3} lagi
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Upcoming Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Event Mendatang
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center">
              <CalendarIcon className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-medium">Tidak ada event terdekat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(ev => (
                <div 
                  key={ev.id} 
                  onClick={() => handleEdit(ev)}
                  className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full ring-4 ring-slate-50" style={{ backgroundColor: ev.color }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{ev.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {ev.dateStart}{ev.dateEnd && ev.dateEnd !== ev.dateStart ? ` — ${ev.dateEnd}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{editItem ? "Edit Event" : "Tambah Event"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl font-light">&times;</button>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Judul Event <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Nama kegiatan atau acara..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Mulai <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={form.dateStart} 
                    onChange={e => setForm({ ...form, dateStart: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Selesai</label>
                  <input 
                    type="date" 
                    value={form.dateEnd} 
                    onChange={e => setForm({ ...form, dateEnd: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Jenis Event</label>
                  <select 
                    value={form.type} 
                    onChange={e => {
                      const opt = typeOptions.find(t => t.value === e.target.value);
                      setForm({ ...form, type: e.target.value, color: opt?.color || form.color });
                    }} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Warna Label</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={form.color} 
                      onChange={e => setForm({ ...form, color: e.target.value })} 
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl p-1 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Keterangan Tambahan</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  rows={3} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-sm"
                  placeholder="Detail acara, lokasi, atau informasi lainnya..."
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Batal
              </button>
              {editItem && (
                <button 
                  onClick={() => handleDelete(editItem.id)} 
                  className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-rose-100"
                >
                  Hapus
                </button>
              )}
              <button 
                onClick={handleSubmit} 
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                {editItem ? "Simpan Perubahan" : "Simpan Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
