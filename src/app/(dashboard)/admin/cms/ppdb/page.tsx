"use client";

import { useState, useEffect } from "react";
import { 
  Save, GraduationCap,
  Users, CreditCard,
  Image as ImageIcon, ToggleLeft
} from "lucide-react";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";

export default function PpdbCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ppdb_year: "2024/2025",
    ppdb_status: "tutup",
    ppdb_quota: "100",
    ppdb_registered: "0",
    ppdb_start_date: "",
    ppdb_end_date: "",
    ppdb_fee: "Rp 250.000",
    ppdb_whatsapp: "628xxxxxxxxxx",
    ppdb_banner_url: ""
  });

  useEffect(() => {
    fetchPpdbInfo();
  }, []);

  const fetchPpdbInfo = async () => {
    try {
      const res = await fetch("/api/web/ppdb/info");
      const data = await res.json();
      if (data.success) {
        const info = data.data;
        setFormData({
          ppdb_year: info.year,
          ppdb_status: info.is_open ? "buka" : "tutup",
          ppdb_quota: info.quota.toString(),
          ppdb_registered: info.registered.toString(),
          ppdb_start_date: info.start_date,
          ppdb_end_date: info.end_date,
          ppdb_fee: info.fee,
          ppdb_whatsapp: info.whatsapp,
          ppdb_banner_url: info.banner_url
        });
      }
    } catch {
      toast.error("Gagal mengambil info PPDB");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch("/api/cms/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: formData, group: "ppdb" })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Pengaturan PPDB disimpan");
        fetchPpdbInfo();
      } else {
        toast.error(result.message || "Gagal menyimpan pengaturan");
      }
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan PPDB</h1>
            <p className="text-slate-500 font-medium">Atur status dan informasi pendaftaran santri baru.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Main Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ToggleLeft className="w-5 h-5 text-indigo-500" />
              Status & Periode
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status Pendaftaran</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  {["buka", "tutup"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData({...formData, ppdb_status: s})}
                      className={`flex-1 py-2 rounded-lg font-bold capitalize transition-all ${formData.ppdb_status === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tahun Ajaran</label>
                <input 
                  type="text" 
                  value={formData.ppdb_year}
                  onChange={(e) => setFormData({...formData, ppdb_year: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="2024/2025"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Mulai</label>
                <input 
                  type="text" 
                  value={formData.ppdb_start_date}
                  onChange={(e) => setFormData({...formData, ppdb_start_date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="1 Januari 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Selesai</label>
                <input 
                  type="text" 
                  value={formData.ppdb_end_date}
                  onChange={(e) => setFormData({...formData, ppdb_end_date: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="30 Juni 2024"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Biaya & Kontak
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Biaya Pendaftaran</label>
                <input 
                  type="text" 
                  value={formData.ppdb_fee}
                  onChange={(e) => setFormData({...formData, ppdb_fee: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Rp 250.000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nomor WhatsApp CS</label>
                <input 
                  type="text" 
                  value={formData.ppdb_whatsapp}
                  onChange={(e) => setFormData({...formData, ppdb_whatsapp: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="628xxxxxxxxxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Banner */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Kuota Santri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Total Kuota</label>
                <input 
                  type="number" 
                  value={formData.ppdb_quota}
                  onChange={(e) => setFormData({...formData, ppdb_quota: e.target.value})}
                  className="w-full text-3xl font-black text-center text-slate-900 bg-slate-50 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Sudah Terdaftar</label>
                <input 
                  type="number" 
                  value={formData.ppdb_registered}
                  onChange={(e) => setFormData({...formData, ppdb_registered: e.target.value})}
                  className="w-full text-3xl font-black text-center text-indigo-600 bg-indigo-50 py-4 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Banner PPDB
            </h3>
            <ImageUpload 
              value={formData.ppdb_banner_url}
              onChange={(url: string) => setFormData({...formData, ppdb_banner_url: url})}
            />
            <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-tighter">Ukuran ideal: 1920x1080 (Lanskap)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
