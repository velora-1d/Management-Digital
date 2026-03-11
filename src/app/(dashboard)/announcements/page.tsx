"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

interface Announcement { id: number; title: string; content: string; target: string; channel: string; scheduledAt: string; sentAt: string; status: string; createdBy?: { name: string }; }

const targetLabels: Record<string, string> = { all: "Semua", guru_staf: "Guru & Staf", wali_murid: "Wali Murid", kelas: "Per Kelas" };
const channelLabels: Record<string, string> = { dashboard: "Dashboard", wa: "WhatsApp", email: "Email" };
const statusColors: Record<string, string> = { draft: "bg-slate-100 text-slate-600", scheduled: "bg-amber-100 text-amber-700", sent: "bg-emerald-100 text-emerald-700" };

export default function AnnouncementsPage() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", content: "", target: "all", channel: "dashboard", scheduledAt: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.title) { Swal.fire("Error", "Judul wajib", "error"); return; }
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `/api/announcements/${editItem.id}` : "/api/announcements";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setEditItem(null);
    setForm({ title: "", content: "", target: "all", channel: "dashboard", scheduledAt: "" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Pengumuman diperbarui" : "Pengumuman dibuat", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ title: "Hapus pengumuman?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (!r.isConfirmed) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: Announcement) => {
    setEditItem(item);
    setForm({ title: item.title, content: item.content, target: item.target, channel: item.channel, scheduledAt: item.scheduledAt });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Pengumuman</h1>
          <p className="text-sm text-slate-500 mt-1">Buat dan kelola pengumuman sekolah</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ title: "", content: "", target: "all", channel: "dashboard", scheduledAt: "" }); setShowModal(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Buat Pengumuman
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-sm text-slate-500">Belum ada pengumuman</p></div>
      ) : (
        <div className="space-y-3">
          {data.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[item.status] || "bg-slate-100 text-slate-600"}`}>{item.status === "sent" ? "Terkirim" : item.status === "scheduled" ? "Terjadwal" : "Draft"}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-semibold">{targetLabels[item.target] || item.target}</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-600 text-[10px] font-semibold">{channelLabels[item.channel] || item.channel}</span>
                  </div>
                  {item.content && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.content}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Oleh: {item.createdBy?.name || "-"}
                    {item.sentAt && ` · Terkirim: ${item.sentAt.split("T")[0]}`}
                    {item.scheduledAt && item.status === "scheduled" && ` · Jadwal: ${item.scheduledAt}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleEdit(item)} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[11px] font-semibold border border-indigo-100 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-100 transition-colors">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Pengumuman" : "Buat Pengumuman"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-600">Judul *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600">Isi Pengumuman</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-600">Target</label>
                  <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {Object.entries(targetLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-slate-600">Channel</label>
                  <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    {Object.entries(channelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-semibold text-slate-600">Jadwal Kirim (opsional, kosongkan untuk kirim sekarang)</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
