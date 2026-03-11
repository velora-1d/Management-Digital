"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";

interface Letter { id: number; type: string; number: string; subject: string; sender: string; receiver: string; date: string; status: string; fileUrl: string; }

const statusColors: Record<string, string> = { belum_disposisi: "bg-rose-100 text-rose-700", sudah_disposisi: "bg-emerald-100 text-emerald-700", diarsip: "bg-slate-100 text-slate-600" };
const statusLabels: Record<string, string> = { belum_disposisi: "Belum Disposisi", sudah_disposisi: "Sudah Disposisi", diarsip: "Diarsipkan" };

export default function LettersPage() {
  const [tab, setTab] = useState<"masuk" | "keluar">("masuk");
  const [data, setData] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Letter | null>(null);
  const [form, setForm] = useState({ type: "masuk", subject: "", sender: "", receiver: "", date: new Date().toISOString().split("T")[0], number: "", status: "belum_disposisi" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/letters?type=${tab}`);
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.subject) { Swal.fire("Error", "Perihal surat wajib", "error"); return; }
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `/api/letters/${editItem.id}` : "/api/letters";
    const payload = { ...form, type: tab };
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setShowModal(false); setEditItem(null);
    setForm({ type: tab, subject: "", sender: "", receiver: "", date: new Date().toISOString().split("T")[0], number: "", status: "belum_disposisi" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Surat diperbarui" : "Surat ditambahkan", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ title: "Hapus surat?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (!r.isConfirmed) return;
    await fetch(`/api/letters/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: Letter) => {
    setEditItem(item);
    setForm({ type: item.type, subject: item.subject, sender: item.sender, receiver: item.receiver, date: item.date, number: item.number, status: item.status });
    setShowModal(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch(`/api/letters/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Manajemen Surat</h1>
          <p className="text-sm text-slate-500 mt-1">Arsip surat masuk dan surat keluar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(null); setForm({ type: tab, subject: "", sender: "", receiver: "", date: new Date().toISOString().split("T")[0], number: "", status: "belum_disposisi" }); setShowModal(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            {tab === "masuk" ? "Catat Surat Masuk" : "Buat Surat Keluar"}
          </button>
          <button onClick={() => {
            if (!data.length) return;
            exportCSV(["No", "Nomor", "Perihal", "Pengirim", "Penerima", "Tanggal", "Status"],
              data.map((d, i) => [i + 1, d.number, d.subject, d.sender, d.receiver, d.date, statusLabels[d.status] || d.status]), `surat_${tab}`);
          }} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1 flex gap-1 max-w-xs">
        <button onClick={() => setTab("masuk")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "masuk" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Surat Masuk</button>
        <button onClick={() => setTab("keluar")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "keluar" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Surat Keluar</button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed"><p className="text-sm text-slate-500">Belum ada surat {tab}</p></div>
      ) : (
        <div className="space-y-3">
          {data.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-800">{item.subject}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[item.status] || "bg-slate-100 text-slate-600"}`}>{statusLabels[item.status] || item.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">No: {item.number || "-"} · {item.date}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tab === "masuk" ? `Dari: ${item.sender}` : `Kepada: ${item.receiver}`}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {tab === "masuk" && item.status === "belum_disposisi" && (
                    <button onClick={() => handleUpdateStatus(item.id, "sudah_disposisi")} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-100 transition-colors">Disposisi</button>
                  )}
                  {item.status !== "diarsip" && (
                    <button onClick={() => handleUpdateStatus(item.id, "diarsip")} className="px-2.5 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded text-[11px] font-semibold border border-slate-100 transition-colors">Arsipkan</button>
                  )}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Surat" : tab === "masuk" ? "Catat Surat Masuk" : "Buat Surat Keluar"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-600">Perihal *</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              {tab === "keluar" && (
                <div><label className="text-xs font-semibold text-slate-600">Nomor Surat</label>
                  <input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="Auto generate jika kosong" className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              )}
              <div><label className="text-xs font-semibold text-slate-600">{tab === "masuk" ? "Pengirim" : "Penerima"}</label>
                <input value={tab === "masuk" ? form.sender : form.receiver} onChange={e => setForm(tab === "masuk" ? { ...form, sender: e.target.value } : { ...form, receiver: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600">Tanggal</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
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
