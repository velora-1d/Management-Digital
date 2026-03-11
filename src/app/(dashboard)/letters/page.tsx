"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { 
  Plus, 
  Download, 
  Mail, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Archive,
  CheckCircle,
  Clock,
  Inbox,
  Send,
  MoreVertical,
  Check
} from "lucide-react";

interface Letter { 
  id: number; 
  type: string; 
  number: string; 
  subject: string; 
  sender: string; 
  receiver: string; 
  date: string; 
  status: string; 
  fileUrl: string; 
}

const statusColors: Record<string, string> = { 
  belum_disposisi: "bg-rose-50 text-rose-700 border-rose-200", 
  sudah_disposisi: "bg-emerald-50 text-emerald-700 border-emerald-200", 
  diarsip: "bg-slate-50 text-slate-600 border-slate-200" 
};
const statusLabels: Record<string, string> = { 
  belum_disposisi: "Belum Disposisi", 
  sudah_disposisi: "Sudah Disposisi", 
  diarsip: "Diarsipkan" 
};

export default function LettersPage() {
  const [tab, setTab] = useState<"masuk" | "keluar">("masuk");
  const [data, setData] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Letter | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ 
    type: "masuk", 
    subject: "", 
    sender: "", 
    receiver: "", 
    date: new Date().toISOString().split("T")[0], 
    number: "", 
    status: "belum_disposisi" 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/letters?type=${tab}`);
      const d = await res.json();
      setData(Array.isArray(d) ? d : []);
    } catch (error) {
      console.error("Gagal mengambil data surat:", error);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.number && item.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.sender && item.sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.receiver && item.receiver.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [data, searchQuery]);

  const handleSubmit = async () => {
    if (!form.subject) { 
      Swal.fire({
        title: "Perhatian",
        text: "Perihal surat wajib diisi",
        icon: "warning",
        confirmButtonColor: "#4f46e5"
      }); 
      return; 
    }

    try {
      const method = editItem ? "PUT" : "POST";
      const url = editItem ? `/api/letters/${editItem.id}` : "/api/letters";
      const payload = { ...form, type: tab };
      
      const response = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });

      if (!response.ok) throw new Error("Gagal menyimpan surat");

      setShowModal(false); 
      setEditItem(null);
      setForm({ type: tab, subject: "", sender: "", receiver: "", date: new Date().toISOString().split("T")[0], number: "", status: "belum_disposisi" });
      fetchData();
      
      Swal.fire({
        title: "Berhasil",
        text: editItem ? "Surat diperbarui" : "Surat ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan surat. Silakan coba lagi.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ 
      title: "Hapus surat?", 
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b"
    });

    if (r.isConfirmed) {
      try {
        await fetch(`/api/letters/${id}`, { method: "DELETE" });
        fetchData();
        Swal.fire({
          title: "Terhapus",
          text: "Surat berhasil dihapus",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus surat", "error");
      }
    }
  };

  const handleEdit = (item: Letter) => {
    setEditItem(item);
    setForm({ 
      type: item.type, 
      subject: item.subject, 
      sender: item.sender, 
      receiver: item.receiver, 
      date: item.date, 
      number: item.number, 
      status: item.status 
    });
    setShowModal(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/letters/${id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ status }) 
      });
      fetchData();
      
      const statusText = status === "sudah_disposisi" ? "didisposisikan" : "diarsipkan";
      Swal.fire({
        title: "Status Diperbarui",
        text: `Surat berhasil ${statusText}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire("Error", "Gagal memperbarui status", "error");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sudah_disposisi": return <CheckCircle className="w-3 h-3" />;
      case "diarsip": return <Archive className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Manajemen Surat"
        subtitle="Arsip surat masuk, surat keluar, dan disposisi"
        icon={<Mail />}
        actions={
          <div className="flex gap-2">
            <button 
              onClick={() => { 
                setEditItem(null); 
                setForm({ type: tab, subject: "", sender: "", receiver: "", date: new Date().toISOString().split("T")[0], number: "", status: "belum_disposisi" }); 
                setShowModal(true); 
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{tab === "masuk" ? "Catat Surat Masuk" : "Buat Surat Keluar"}</span>
            </button>
            <button 
              onClick={() => {
                if (!data.length) {
                  Swal.fire("Info", "Tidak ada data untuk diexport", "info");
                  return;
                }
                exportCSV(["No", "Nomor", "Perihal", "Pengirim", "Penerima", "Tanggal", "Status"],
                  data.map((d, i) => [i + 1, d.number, d.subject, d.sender, d.receiver, d.date, statusLabels[d.status] || d.status]), `surat_${tab}`);
              }} 
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        }
      />

      <Card className="p-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex p-1 bg-slate-100/80 rounded-xl max-w-sm">
            <button 
              onClick={() => { setTab("masuk"); setSearchQuery(""); }} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${tab === "masuk" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              <Inbox className="w-4 h-4" />
              <span>Surat Masuk</span>
            </button>
            <button 
              onClick={() => { setTab("keluar"); setSearchQuery(""); }} 
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${tab === "keluar" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
            >
              <Send className="w-4 h-4" />
              <span>Surat Keluar</span>
            </button>
          </div>
          
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Cari surat ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-28 animate-pulse bg-slate-50"><div /></Card>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <Card className="py-16 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-semibold mb-1">Surat tidak ditemukan</h3>
          <p className="text-slate-500 text-sm max-w-sm px-4">
            {searchQuery 
              ? "Tidak ada surat yang sesuai dengan kriteria pencarian Anda." 
              : `Belum ada data surat ${tab} yang ditambahkan.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredData.map(item => (
            <Card key={item.id} className="group hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[item.status as keyof typeof statusColors] || statusColors.belum_disposisi}`}>
                      {getStatusIcon(item.status)}
                      {statusLabels[item.status as keyof typeof statusLabels] || item.status}
                    </span>
                    <span className="text-xs font-medium text-slate-500 ml-1">
                      No: {item.number || "Belum ada nomor"}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-1.5 truncate group-hover:text-indigo-700 transition-colors">
                    {item.subject}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-[200px]">
                        {tab === "masuk" ? <span>Dari: <span className="font-semibold text-slate-700">{item.sender}</span></span> : <span>Kepada: <span className="font-semibold text-slate-700">{item.receiver}</span></span>}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-6">
                  {tab === "masuk" && item.status === "belum_disposisi" && (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, "sudah_disposisi")} 
                      className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Disposisi</span>
                    </button>
                  )}
                  {item.status !== "diarsip" && (
                    <button 
                      onClick={() => handleUpdateStatus(item.id, "diarsip")} 
                      className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      <span className="hidden sm:inline">Arsipkan</span>
                    </button>
                  )}
                  
                  <div className="flex gap-1 ml-2">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Cerdik */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${tab === "masuk" ? "bg-indigo-50 text-indigo-600" : "bg-violet-50 text-violet-600"}`}>
                  {tab === "masuk" ? <Inbox className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {editItem ? "Edit Surat" : tab === "masuk" ? "Catat Surat Masuk" : "Buat Surat Keluar"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Isi formulir dengan detail surat yang benar</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 bg-white space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Perihal / Subjek Surat *</label>
                <input 
                  value={form.subject} 
                  onChange={e => setForm({ ...form, subject: e.target.value })} 
                  placeholder="Contoh: Undangan Rapat Wali Murid"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{tab === "masuk" ? "Asal Pengirim" : "Tujuan / Penerima"}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      value={tab === "masuk" ? form.sender : form.receiver} 
                      onChange={e => setForm(tab === "masuk" ? { ...form, sender: e.target.value } : { ...form, receiver: e.target.value })} 
                      placeholder={tab === "masuk" ? "Kementerian Pendidikan" : "Wali Murid Kelas 10"}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Surat</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={form.date} 
                      onChange={e => setForm({ ...form, date: e.target.value })} 
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nomor Surat</label>
                <input 
                  value={form.number} 
                  onChange={e => setForm({ ...form, number: e.target.value })} 
                  placeholder={tab === "keluar" ? "Boleh dikosongkan untuk auto-generate" : "Masukkan nomor surat masuk"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                />
              </div>

              {editItem && (
                 <div>
                 <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status Saat Ini</label>
                 <select 
                   value={form.status} 
                   onChange={e => setForm({ ...form, status: e.target.value })} 
                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                 >
                   {Object.entries(statusLabels).map(([k, v]) => (
                     <option key={k} value={k}>{v}</option>
                   ))}
                 </select>
               </div>
              )}
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
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-all"
              >
                {editItem ? "Simpan Perubahan" : "Simpan Surat"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
