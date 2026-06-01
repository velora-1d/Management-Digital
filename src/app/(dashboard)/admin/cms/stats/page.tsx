"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, X, 
  Trophy, Users, GraduationCap, Building2,
  Star, Heart, Lightbulb, Target
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

interface Stat {
  id: number;
  label: string;
  value: number;
  suffix: string;
  iconName: string;
  color: string;
  order: number;
  status: string;
}

const ICON_OPTIONS = [
  { name: "Trophy", icon: Trophy },
  { name: "Users", icon: Users },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Building2", icon: Building2 },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Target", icon: Target },
];

const COLOR_OPTIONS = [
  { name: "Amber", value: "from-amber-500 to-orange-600" },
  { name: "Blue", value: "from-blue-500 to-indigo-600" },
  { name: "Emerald", value: "from-emerald-500 to-teal-600" },
  { name: "Rose", value: "from-rose-500 to-pink-600" },
  { name: "Purple", value: "from-purple-500 to-violet-600" },
];

export default function StatsCMS() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    value: 0,
    suffix: "+",
    iconName: "Trophy",
    color: "from-amber-500 to-orange-600",
    order: 0,
    status: "aktif"
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/cms/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      toast.error("Gagal mengambil data statistik");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = editingStat?.id ? { ...formData, id: editingStat.id } : formData;
      const res = await fetch("/api/cms/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(editingStat ? "Statistik diperbarui" : "Statistik ditambahkan");
        setIsModalOpen(false);
        setEditingStat(null);
        setFormData({ label: "", value: 0, suffix: "+", iconName: "Trophy", color: "from-amber-500 to-orange-600", order: 0, status: "aktif" });
        fetchStats();
      } else {
        toast.error(result.message || "Gagal menyimpan statistik");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus statistik ini?")) return;
    
    try {
      const res = await fetch(`/api/cms/stats?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Statistik dihapus");
        fetchStats();
      }
    } catch {
      toast.error("Gagal menghapus statistik");
    }
  };

  const openEdit = (stat: Stat) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix,
      iconName: stat.iconName,
      color: stat.color,
      order: stat.order,
      status: stat.status
    });
    setIsModalOpen(true);
  };

  const getIcon = (name: string) => {
    const Option = ICON_OPTIONS.find(o => o.name === name);
    if (!Option) return <Trophy className="w-6 h-6" />;
    return <Option.icon className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statistik Sekolah</h1>
          <p className="text-slate-500 mt-1">Kelola angka statistik (pencapaian) yang ditampilkan di website.</p>
        </div>
        <button 
          onClick={() => {
            setEditingStat(null);
            setFormData({ label: "", value: 0, suffix: "+", iconName: "Trophy", color: "from-amber-500 to-orange-600", order: 0, status: "aktif" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
        >
          <Plus className="w-5 h-5" />
          Tambah Statistik
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && stats.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Memuat data statistik...</p>
          </div>
        ) : (
          stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
              <div className={`h-1.5 bg-linear-to-r ${stat.color}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center shadow-lg text-white`}>
                    {getIcon(stat.iconName)}
                  </div>
                  <Badge variant={stat.status === "aktif" ? "success" : "neutral"}>
                    {stat.status}
                  </Badge>
                </div>
                <div className="mb-6">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-slate-500 font-medium">{stat.label}</div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => openEdit(stat)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 font-bold transition-colors text-sm">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(stat.id)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-4xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingStat ? "Edit Statistik" : "Tambah Statistik Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Label Statistik</label>
                  <input 
                    type="text" 
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Total Alumni"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nilai Angka</label>
                    <input 
                      type="number" 
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Akhiran (Suffix)</label>
                    <input 
                      type="text" 
                      value={formData.suffix}
                      onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="+, %, dll"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Ikon</label>
                    <div className="flex gap-2 flex-wrap">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setFormData({...formData, iconName: opt.name})}
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${formData.iconName === opt.name ? "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-200" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                          <opt.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Warna Tema</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setFormData({...formData, color: opt.value})}
                          className={`w-6 h-6 rounded-full bg-linear-to-br ${opt.value} border-2 ${formData.color === opt.value ? "border-slate-900 scale-125" : "border-transparent"}`}
                          title={opt.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-3.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : editingStat ? "Simpan Perubahan" : "Tambah Statistik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
