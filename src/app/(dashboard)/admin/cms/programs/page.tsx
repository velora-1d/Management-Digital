"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, X, 
  BookOpen, Trophy, Users, Star,
  GraduationCap, Building2, Heart, Lightbulb, Target
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

interface Program {
  id: number;
  title: string;
  description: string;
  iconName: string;
  color: string;
  order: number;
  status: string;
}

const ICON_OPTIONS = [
  { name: "BookOpen",     icon: BookOpen },
  { name: "Trophy",      icon: Trophy },
  { name: "Users",       icon: Users },
  { name: "Star",        icon: Star },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Building2",   icon: Building2 },
  { name: "Heart",       icon: Heart },
  { name: "Lightbulb",   icon: Lightbulb },
  { name: "Target",      icon: Target },
];

const getIcon = (name: string) => {
  const option = ICON_OPTIONS.find((o) => o.name === name);
  if (!option) return <BookOpen className="w-6 h-6" />;
  const IconComp = option.icon;
  return <IconComp className="w-6 h-6" />;
};

const COLOR_OPTIONS = [
  { name: "Emerald", value: "from-emerald-500 to-teal-600" },
  { name: "Blue", value: "from-blue-500 to-indigo-600" },
  { name: "Amber", value: "from-amber-500 to-orange-600" },
  { name: "Rose", value: "from-rose-500 to-pink-600" },
  { name: "Purple", value: "from-purple-500 to-violet-600" },
];

export default function ProgramsCMS() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    iconName: "BookOpen",
    color: "from-emerald-500 to-teal-600",
    order: 0,
    status: "aktif"
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/cms/programs");
      const data = await res.json();
      if (data.success) {
        setPrograms(data.data);
      }
    } catch {
      toast.error("Gagal mengambil data program");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = editingProgram?.id ? { ...formData, id: editingProgram.id } : formData;
      const res = await fetch("/api/cms/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(editingProgram ? "Program diperbarui" : "Program ditambahkan");
        setIsModalOpen(false);
        setEditingProgram(null);
        setFormData({ title: "", description: "", iconName: "BookOpen", color: "from-emerald-500 to-teal-600", order: 0, status: "aktif" });
        fetchPrograms();
      } else {
        toast.error(result.message || "Gagal menyimpan program");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus program ini?")) return;
    
    try {
      const res = await fetch(`/api/cms/programs?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("Program dihapus");
        fetchPrograms();
      }
    } catch {
      toast.error("Gagal menghapus program");
    }
  };

  const openEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      iconName: program.iconName,
      color: program.color,
      order: program.order,
      status: program.status
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Program Unggulan</h1>
          <p className="text-slate-500 mt-1">Kelola program unggulan yang ditampilkan di halaman beranda.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProgram(null);
            setFormData({ title: "", description: "", iconName: "BookOpen", color: "from-emerald-500 to-teal-600", order: 0, status: "aktif" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" />
          Tambah Program
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && programs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Memuat data program...</p>
          </div>
        ) : (
          programs.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
              <div className={`h-2 bg-linear-to-r ${prog.color}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${prog.color} flex items-center justify-center shadow-lg text-white`}>
                    {getIcon(prog.iconName)}
                  </div>
                  <Badge variant={prog.status === "aktif" ? "success" : "neutral"}>
                    {prog.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{prog.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6">{prog.description}</p>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => openEdit(prog)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition-colors">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(prog.id)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
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
          <div className="bg-white rounded-4xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editingProgram ? "Edit Program" : "Tambah Program Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Judul Program</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Program Tahfidz Qur'an"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-24"
                    placeholder="Jelaskan secara singkat tentang program ini..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Ikon</label>
                    <div className="flex gap-2">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setFormData({...formData, iconName: opt.name})}
                          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${formData.iconName === opt.name ? "border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-200" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                        >
                          <opt.icon className="w-5 h-5" />
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
                  className="flex-2 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : editingProgram ? "Simpan Perubahan" : "Tambah Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
