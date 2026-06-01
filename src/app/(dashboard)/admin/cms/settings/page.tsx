'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import Swal from 'sweetalert2';

export default function SettingsCMS() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettingsData = async () => {
    try {
      const res = await fetch('/api/web/settings');
      const data = await res.json();
      
      let flat: Record<string, string> = {};
      if (data.data && typeof data.data === 'object') {
        const firstValue = Object.values(data.data)[0];
        if (typeof firstValue === 'object' && firstValue !== null && !Array.isArray(firstValue)) {
          Object.values(data.data).forEach((group: unknown) => {
            if (typeof group === 'object' && group !== null) Object.assign(flat, group);
          });
        } else {
          flat = data.data as Record<string, string>;
        }
      }
      
      setSettings(flat || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data })
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire('Berhasil', result.message, 'success');
        fetchSettingsData();
      } else {
        Swal.fire('Gagal', result.message, 'error');
      }
    } catch {
      Swal.fire('Error', 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  }

  const sections = [
    {
      title: "Informasi Sekolah & Branding",
      fields: [
        { key: "school_name", label: "Nama Sekolah", placeholder: "MI As-Sa'adah" },
        { key: "school_tagline", label: "Tagline Sekolah", placeholder: "Mencetak generasi berilmu..." },
        { key: "school_email", label: "Email Resmi", placeholder: "admin@..." },
        { key: "school_phone", label: "Nomor Telepon", placeholder: "08..." },
        { key: "school_address", label: "Alamat Lengkap", placeholder: "Jl. Raya Pendidikan No. 123, Kota..." },
        { key: "ppdb_whatsapp", label: "WhatsApp PPDB (format: 628xxx)", placeholder: "628123456789" },
        { key: "web_logo_url", label: "Logo Sekolah", type: "image" },
      ]
    },
    {
      title: "Banner & Tampilan Utama",
      fields: [
        { key: "banner_home", label: "Banner Utama (Home)", type: "image" },
        { key: "banner_ppdb", label: "Banner PPDB (Bawah)", type: "image" },
        { key: "banner_tentang", label: "Banner Halaman Tentang Kami", type: "image" },
      ]
    },
    {
      title: "Media Sosial",
      fields: [
        { key: "social_facebook", label: "Facebook Link", placeholder: "https://facebook.com/..." },
        { key: "social_instagram", label: "Instagram Link", placeholder: "https://instagram.com/..." },
        { key: "social_youtube", label: "Youtube Link", placeholder: "https://youtube.com/..." },
        { key: "social_tiktok", label: "Tiktok Link", placeholder: "https://tiktok.com/..." },
      ]
    },
    {
      title: "SEO Website",
      fields: [
        { key: "web_title", label: "Website Title", placeholder: "Profil MI As-Sa'adah - Modern & Kreatif" },
        { key: "web_description", label: "Meta Description", placeholder: "Portal resmi ..." },
        { key: "web_keywords", label: "Keywords (pisahkan koma)", placeholder: "madrasah, sekolah, ..." },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Website</h1>
          <p className="text-slate-500">Kelola identitas, banner, dan media sosial website profil.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-300 animate-pulse">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-6">
            {sections.map((section, si) => (
              <div key={si} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  {section.title}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((f) => (
                    <div key={f.key} className={f.type === 'image' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{f.label}</label>
                      {f.type === 'image' ? (
                        <ImageUpload name={f.key} defaultValue={settings[f.key] || ''} />
                      ) : (
                        <Input name={f.key} defaultValue={settings[f.key] || ''} placeholder={f.placeholder} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Narasi & Visi Misi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">📜</div>
              <h2 className="text-xl font-bold text-slate-900">Narasi & Visi Misi</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Sejarah Singkat</label>
                <textarea 
                  name="school_history" 
                  defaultValue={settings.school_history} 
                  rows={4} 
                  placeholder="Ceritakan sejarah berdirinya sekolah..."
                  className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Visi Sekolah</label>
                  <textarea 
                    name="school_vision" 
                    defaultValue={settings.school_vision} 
                    rows={3} 
                    placeholder="Visi utama sekolah..."
                    className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Misi Sekolah</label>
                  <textarea 
                    name="school_mission" 
                    defaultValue={settings.school_mission} 
                    rows={3} 
                    placeholder="Misi-misi sekolah (pisahkan dengan baris baru)..."
                    className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="px-12 shadow-xl shadow-indigo-200" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
