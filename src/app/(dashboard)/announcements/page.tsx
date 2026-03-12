"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import { 
  Plus, 
  Bell, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  MessageCircle, 
  AtSign, 
  Clock, 
  Calendar, 
  Send,
  MoreVertical,
  ChevronDown,
  LayoutGrid
} from "lucide-react";

interface Announcement { 
  id: number; 
  title: string; 
  content: string; 
  target: string; 
  channel: string; 
  scheduledAt: string; 
  sentAt: string; 
  status: string; 
  createdBy?: { name: string }; 
}

const targetLabels: Record<string, string> = { 
  all: "Semua", 
  guru_staf: "Guru & Staf", 
  wali_murid: "Wali Murid", 
  kelas: "Per Kelas" 
};

const channelLabels: Record<string, string> = { 
  dashboard: "Dashboard", 
  wa: "WhatsApp", 
  email: "Email" 
};

const statusColors: Record<string, string> = { 
  draft: "bg-slate-100 text-slate-600 border-slate-200", 
  scheduled: "bg-amber-50 text-amber-700 border-amber-200", 
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200" 
};

export default function AnnouncementsPage() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [form, setForm] = useState({ 
    title: "", 
    content: "", 
    target: "all", 
    channel: "dashboard", 
    scheduledAt: "" 
  });
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements?page=${page}&limit=${paginationMeta.limit}&search=${searchQuery}&target=${targetFilter}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (json.pagination) {
          setPaginationMeta(json.pagination);
        }
      } else if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
    setLoading(false);
  }, [paginationMeta.limit, searchQuery, targetFilter]);

  useEffect(() => { 
    const timer = setTimeout(() => {
      fetchData(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, targetFilter, fetchData]);


  const handleSubmit = async () => {
    if (!form.title) { 
      Swal.fire({
        title: "Error",
        text: "Judul pengumuman wajib diisi",
        icon: "error",
        confirmButtonColor: "#4f46e5"
      }); 
      return; 
    }
    
    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/announcements/${editItem.id}` : "/api/announcements";
      
      const response = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(form) 
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      setShowModal(false); 
      setEditItem(null);
      setForm({ title: "", content: "", target: "all", channel: "dashboard", scheduledAt: "" });
      fetchData();
      
      Swal.fire({
        title: "Berhasil",
        text: editItem ? "Pengumuman berhasil diperbarui" : "Pengumuman berhasil dibuat",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan pengumuman", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ 
      title: "Hapus pengumuman?", 
      text: "Tindakan ini tidak dapat dibatalkan",
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b"
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/announcements/${id}`, { method: "DELETE" });
        fetchData();
        Swal.fire({
          title: "Terhapus",
          text: "Pengumuman telah dihapus",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus pengumuman", "error");
      }
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditItem(item);
    setForm({ 
      title: item.title, 
      content: item.content, 
      target: item.target, 
      channel: item.channel, 
      scheduledAt: item.scheduledAt || "" 
    });
    setShowModal(true);
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case "all": return <Users className="w-4 h-4" />;
      case "guru_staf": return <AtSign className="w-4 h-4" />;
      case "wali_murid": return <MessageCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Pengumuman"
        subtitle="Buat dan kelola pengumuman sekolah untuk seluruh elemen"
        icon={<Bell className="w-6 h-6 text-indigo-600" />}
        actions={
          <button 
            onClick={() => { 
              setEditItem(null); 
              setForm({ title: "", content: "", target: "all", channel: "dashboard", scheduledAt: "" }); 
              setShowModal(true); 
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman</span>
          </button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="all">Semua Target</option>
                <option value="guru_staf">Guru & Staf</option>
                <option value="wali_murid">Wali Murid</option>
                <option value="kelas">Per Kelas</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-slate-50"><div /></Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card className="py-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-semibold">Tidak ada pengumuman</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1 px-4">
            {searchQuery || targetFilter !== "all" 
              ? "Tidak ditemukan pengumuman yang sesuai dengan filter Anda." 
              : "Mulai buat pengumuman pertama Anda untuk memberikan informasi penting kepada staf atau wali murid."}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(item => (
              <Card key={item.id} className="group hover:border-indigo-200 hover:shadow-md transition-all flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[item.status as keyof typeof statusColors] || statusColors.draft}`}>
                      {item.status === "sent" ? <Send className="w-3 h-3" /> : item.status === "scheduled" ? <Clock className="w-3 h-3" /> : null}
                      {item.status === "sent" ? "Terkirim" : item.status === "scheduled" ? "Terjadwal" : "Draft"}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-indigo-700 transition-colors">{item.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{item.content}</p>
                  
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <div className="p-1 bg-slate-100 rounded text-slate-600">
                        {getTargetIcon(item.target)}
                      </div>
                      <span>Target: <strong>{targetLabels[item.target as keyof typeof targetLabels] || item.target}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <div className="p-1 bg-slate-100 rounded text-slate-600">
                        <LayoutGrid className="w-3 h-3" />
                      </div>
                      <span>Channel: <strong>{channelLabels[item.channel as keyof typeof channelLabels] || item.channel}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-between items-center text-[10px] text-slate-400 italic">
                  <span>Oleh: {item.createdBy?.name || "Sistem"}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.sentAt ? item.sentAt.split("T")[0] : item.scheduledAt ? `Jadwal: ${item.scheduledAt}` : "Baru saja"}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <Pagination
              page={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              total={paginationMeta.total}
              limit={paginationMeta.limit}
              onPageChange={(p: number) => fetchData(p)}
            />
          </Card>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{editItem ? "Edit Pengumuman" : "Buat Pengumuman Baru"}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Lengkapi detail pengumuman di bawah ini</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Plus className="w-5 h-5 text-slate-400 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 bg-white max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Judul Pengumuman *</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  placeholder="Contoh: Libur Nasional Idul Fitri"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Isi Pengumuman</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({ ...form, content: e.target.value })} 
                  rows={5} 
                  placeholder="Tuliskan isi pengumuman secara detail di sini..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Penerima</label>
                  <div className="relative">
                    <select 
                      value={form.target} 
                      onChange={e => setForm({ ...form, target: e.target.value })} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      {Object.entries(targetLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kanal Pengiriman</label>
                  <div className="relative">
                    <select 
                      value={form.channel} 
                      onChange={e => setForm({ ...form, channel: e.target.value })} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      {Object.entries(channelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jadwal Pengiriman</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="datetime-local" 
                    value={form.scheduledAt} 
                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })} 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 italic">* Kosongkan untuk mengirim sekarang sebagai dashboard announcement</p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit} 
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
              >
                {itemSentStatus(form.scheduledAt) ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{editItem ? "Simpan Perbaikan" : itemSentStatus(form.scheduledAt) ? "Jadwalkan" : "Kirim Sekarang"}</span>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function itemSentStatus(scheduledAt: string) {
  if (!scheduledAt) return false;
  const sched = new Date(scheduledAt);
  const now = new Date();
  return sched > now;
}
