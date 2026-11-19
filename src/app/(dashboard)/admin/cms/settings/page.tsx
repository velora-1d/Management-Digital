'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';
import Swal from 'sweetalert2';

interface PillarItem {
  title: string;
  desc: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'beranda' | 'tentang' | 'ppdb' | 'identitas' | null;

  const [activeTab, setActiveTab] = useState<'beranda' | 'tentang' | 'ppdb' | 'identitas'>(initialTab || 'beranda');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [missionPoints, setMissionPoints] = useState<string[]>([]);
  const [pillars, setPillars] = useState<PillarItem[]>([]);
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

      // Parse mission points
      if (flat.school_mission) {
        const points = flat.school_mission.split('\n').map(p => p.trim()).filter(Boolean);
        setMissionPoints(points.length > 0 ? points : ['Menyelenggarakan pendidikan berkualitas berdasarkan Al-Quran dan Sunnah']);
      } else {
        setMissionPoints([
          'Menyelenggarakan pendidikan berkualitas berdasarkan Al-Quran dan Sunnah',
          'Mengembangkan potensi akademik dan non-akademik santri secara optimal',
          'Membina adab dan kesantunan dalam interaksi sehari-hari',
          'Mencetak generasi yang kompetitif di era global'
        ]);
      }

      // Parse pillars
      const loadedPillars: PillarItem[] = [];
      for (let i = 1; i <= 6; i++) {
        const titleKey = `values_title_${i}`;
        const descKey = `values_desc_${i}`;
        if (flat[titleKey] || flat[descKey]) {
          loadedPillars.push({
            title: flat[titleKey] || '',
            desc: flat[descKey] || '',
          });
        }
      }
      if (loadedPillars.length > 0) {
        setPillars(loadedPillars);
      } else {
        setPillars([
          { title: "Qur'ani", desc: "Menanamkan kecintaan dan pengamalan nilai Al-Qur'an sejak dini." },
          { title: "Berakhlak Mulia", desc: "Membina adab dan kesantunan dalam interaksi sehari-hari." },
          { title: "Berwawasan Global", desc: "Mempersiapkan santri dengan wawasan ilmu pengetahuan modern." },
          { title: "Cinta Tanah Air", desc: "Menumbuhkan jiwa nasionalisme dan kepedulian sosial." },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'beranda' | 'tentang' | 'ppdb' | 'identitas' | null;
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleAddMissionPoint = () => {
    setMissionPoints([...missionPoints, '']);
  };

  const handleRemoveMissionPoint = (index: number) => {
    setMissionPoints(missionPoints.filter((_, i) => i !== index));
  };

  const handleMissionChange = (index: number, text: string) => {
    const updated = [...missionPoints];
    updated[index] = text;
    setMissionPoints(updated);
  };

  const handleAddPillar = () => {
    setPillars([...pillars, { title: '', desc: '' }]);
  };

  const handleRemovePillar = (index: number) => {
    setPillars(pillars.filter((_, i) => i !== index));
  };

  const handlePillarChange = (index: number, field: 'title' | 'desc', text: string) => {
    const updated = [...pillars];
    updated[index][field] = text;
    setPillars(updated);
  };

  const handleFieldChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    // Gabungkan array poin misi
    data.school_mission = missionPoints.map(p => p.trim()).filter(Boolean).join('\n');

    // Gabungkan pilar nilai-nilai
    for (let i = 0; i < pillars.length; i++) {
      data[`values_title_${i + 1}`] = pillars[i].title;
      data[`values_desc_${i + 1}`] = pillars[i].desc;
    }

    // Masukkan semua state settings yang mungkin tidak ada di tab form saat ini
    const merged = { ...settings, ...data };

    try {
      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: merged })
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Seluruh section halaman berhasil disimpan!',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchSettingsData();
      } else {
        Swal.fire('Gagal', result.message || 'Gagal menyimpan pengaturan', 'error');
      }
    } catch {
      Swal.fire('Error', 'Terjadi kesalahan server saat menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
            CMS Page Builder &amp; Section Customizer
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Editor Konten Per Halaman</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola setiap section, banner, teks, dan poin dinamis per menu halaman.</p>
        </div>
      </div>

      {/* Tabs Menu Halaman */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('beranda')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'beranda'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span>Halaman Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tentang')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'tentang'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Halaman Tentang Kami</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ppdb')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ppdb'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
          <span>Section PPDB Online</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('identitas')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'identitas'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span>Identitas &amp; Medsos Global</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-300 animate-pulse">
          Memuat seluruh konfigurasi halaman...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ─── TAB 1: BERANDA ─── */}
          {activeTab === 'beranda' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Section 1: Hero Banner &amp; Tagline Beranda</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Badge</label>
                    <Input 
                      name="home_hero_badge" 
                      defaultValue={settings.home_hero_badge || ''} 
                      placeholder="Madrasah Ibtidaiyah Unggulan" 
                      onChange={(e) => handleFieldChange('home_hero_badge', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Utama Hero</label>
                    <Input 
                      name="home_hero_title" 
                      defaultValue={settings.home_hero_title || ''} 
                      placeholder="Membangun Generasi Qur'ani & Berwawasan Global" 
                      onChange={(e) => handleFieldChange('home_hero_title', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle / Narasi Hero</label>
                    <textarea 
                      name="home_hero_subtitle" 
                      defaultValue={settings.home_hero_subtitle || ''} 
                      rows={3} 
                      placeholder="Mencetak generasi berilmu, berakhlak mulia, dan siap menghadapi masa depan..."
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Background Hero (Gambar Utama)</label>
                    <ImageUpload 
                      name="banner_home" 
                      defaultValue={settings.banner_home || ''} 
                      onUploadSuccess={(url) => handleFieldChange('banner_home', url)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">Section 2: Banner Ajakan PPDB di Beranda</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Ajakan PPDB</label>
                    <Input 
                      name="ppdb_cta_title" 
                      defaultValue={settings.ppdb_cta_title || ''} 
                      placeholder="Siap Bergabung dengan Keluarga Besar Kami?" 
                      onChange={(e) => handleFieldChange('ppdb_cta_title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle Ajakan</label>
                    <Input 
                      name="ppdb_cta_subtitle" 
                      defaultValue={settings.ppdb_cta_subtitle || ''} 
                      placeholder="Pendaftaran Peserta Didik Baru telah dibuka. Kuota terbatas!" 
                      onChange={(e) => handleFieldChange('ppdb_cta_subtitle', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Background Section PPDB</label>
                    <ImageUpload 
                      name="banner_ppdb" 
                      defaultValue={settings.banner_ppdb || ''} 
                      onUploadSuccess={(url) => handleFieldChange('banner_ppdb', url)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: TENTANG KAMI ─── */}
          {activeTab === 'tentang' && (
            <div className="space-y-6">
              {/* Banner Header Tentang */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Section 1: Banner Header Halaman Tentang</h2>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gambar Banner Halaman Tentang</label>
                  <ImageUpload 
                    name="banner_tentang" 
                    defaultValue={settings.banner_tentang || ''} 
                    onUploadSuccess={(url) => handleFieldChange('banner_tentang', url)}
                  />
                </div>
              </div>

              {/* Sejarah & Motto */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-base font-bold text-slate-900">Section 2: Sejarah Singkat &amp; Motto</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Narasi Sejarah Singkat</label>
                    <textarea 
                      name="school_history" 
                      defaultValue={settings.school_history || ''} 
                      rows={5} 
                      placeholder="Ceritakan sejarah berdirinya sekolah..."
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Kutipan / Motto Sekolah</label>
                      <Input 
                        name="school_quote" 
                        defaultValue={settings.school_quote || ''} 
                        placeholder="Mendidik dengan hati, membangun masa depan dengan ilmu." 
                        onChange={(e) => handleFieldChange('school_quote', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Penulis / Pengasuh Kutipan</label>
                      <Input 
                        name="school_quote_author" 
                        defaultValue={settings.school_quote_author || ''} 
                        placeholder="Kepala Madrasah" 
                        onChange={(e) => handleFieldChange('school_quote_author', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Foto Dokumentasi Sejarah Sekolah</label>
                    <ImageUpload 
                      name="history_image" 
                      defaultValue={settings.history_image || ''} 
                      onUploadSuccess={(url) => handleFieldChange('history_image', url)}
                    />
                  </div>
                </div>
              </div>

              {/* Visi & Misi (+ Repeater Tambah Poin) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                  <h2 className="text-base font-bold text-slate-900">Section 3: Visi &amp; Misi (+ Fitur Tambah Poin)</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Visi Utama Madrasah</label>
                    <textarea 
                      name="school_vision" 
                      defaultValue={settings.school_vision || ''} 
                      rows={3} 
                      placeholder="Visi utama madrasah..."
                      className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    />
                  </div>

                  {/* Repeater Poin Misi */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          Poin-Poin Misi Madrasah
                        </h3>
                        <p className="text-xs text-slate-500">Gunakan tombol tambah poin untuk memasukkan poin misi baru secara terstruktur.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMissionPoint}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        + Tambah Poin Misi
                      </button>
                    </div>

                    <div className="space-y-3">
                      {missionPoints.map((point, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleMissionChange(index, e.target.value)}
                            placeholder={`Tuliskan misi ke-${index + 1}...`}
                            className="w-full px-3 py-1.5 text-sm text-slate-800 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMissionPoint(index)}
                            disabled={missionPoints.length <= 1}
                            className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                            title="Hapus poin ini"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nilai-Nilai Utama / Pilar Karakter (+ Repeater Pilar) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h2 className="text-base font-bold text-slate-900">Section 4: Pilar Karakter &amp; Nilai Utama</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPillar}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    + Tambah Pilar Karakter
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pillars.map((pillar, index) => (
                    <div key={index} className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          Pilar #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePillar(index)}
                          disabled={pillars.length <= 1}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30 p-1 transition-colors cursor-pointer"
                          title="Hapus pilar ini"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Judul Pilar</label>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => handlePillarChange(index, 'title', e.target.value)}
                          placeholder="Contoh: Qur'ani"
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Deskripsi Pilar</label>
                        <textarea
                          rows={2}
                          value={pillar.desc}
                          onChange={(e) => handlePillarChange(index, 'desc', e.target.value)}
                          placeholder="Penjelasan karakter..."
                          className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: PPDB ─── */}
          {activeTab === 'ppdb' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Informasi Kuota &amp; Narasi PPDB</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahun Ajaran PPDB</label>
                    <Input 
                      name="ppdb_year" 
                      defaultValue={settings.ppdb_year || ''} 
                      placeholder="2025/2026" 
                      onChange={(e) => handleFieldChange('ppdb_year', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor WhatsApp PPDB (format: 628xxx)</label>
                    <Input 
                      name="ppdb_whatsapp" 
                      defaultValue={settings.ppdb_whatsapp || ''} 
                      placeholder="628123456789" 
                      onChange={(e) => handleFieldChange('ppdb_whatsapp', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Biaya Pendaftaran</label>
                    <Input 
                      name="ppdb_fee" 
                      defaultValue={settings.ppdb_fee || ''} 
                      placeholder="Gratis / Rp 150.000" 
                      onChange={(e) => handleFieldChange('ppdb_fee', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Kuota Penerimaan</label>
                    <Input 
                      name="ppdb_quota" 
                      defaultValue={settings.ppdb_quota || ''} 
                      placeholder="60 Siswa" 
                      onChange={(e) => handleFieldChange('ppdb_quota', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 4: IDENTITAS & MEDSOS ─── */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Identitas Lembaga &amp; Branding</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Resmi Sekolah</label>
                    <Input 
                      name="school_name" 
                      defaultValue={settings.school_name || ''} 
                      placeholder="MI MH As-Saodah" 
                      onChange={(e) => handleFieldChange('school_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tagline Sekolah</label>
                    <Input 
                      name="school_tagline" 
                      defaultValue={settings.school_tagline || ''} 
                      placeholder="Mencetak generasi berilmu..." 
                      onChange={(e) => handleFieldChange('school_tagline', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">NPSN</label>
                    <Input 
                      name="npsn" 
                      defaultValue={settings.npsn || ''} 
                      placeholder="12345678" 
                      onChange={(e) => handleFieldChange('npsn', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Akreditasi</label>
                    <Input 
                      name="akreditasi" 
                      defaultValue={settings.akreditasi || ''} 
                      placeholder="A (Unggul)" 
                      onChange={(e) => handleFieldChange('akreditasi', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Resmi</label>
                    <Input 
                      name="school_email" 
                      defaultValue={settings.school_email || ''} 
                      placeholder="admin@assaodah.sch.id" 
                      onChange={(e) => handleFieldChange('school_email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Telepon Kantor</label>
                    <Input 
                      name="school_phone" 
                      defaultValue={settings.school_phone || ''} 
                      placeholder="08xxxxxxxxxx" 
                      onChange={(e) => handleFieldChange('school_phone', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Lengkap</label>
                    <Input 
                      name="school_address" 
                      defaultValue={settings.school_address || ''} 
                      placeholder="Jl. Raya Pendidikan No. 123..." 
                      onChange={(e) => handleFieldChange('school_address', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Logo Resmi Sekolah</label>
                    <ImageUpload 
                      name="web_logo_url" 
                      defaultValue={settings.web_logo_url || ''} 
                      onUploadSuccess={(url) => handleFieldChange('web_logo_url', url)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Media Sosial &amp; Google Maps</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Instagram Link</label>
                    <Input 
                      name="social_instagram" 
                      defaultValue={settings.social_instagram || ''} 
                      placeholder="https://instagram.com/..." 
                      onChange={(e) => handleFieldChange('social_instagram', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook Link</label>
                    <Input 
                      name="social_facebook" 
                      defaultValue={settings.social_facebook || ''} 
                      placeholder="https://facebook.com/..." 
                      onChange={(e) => handleFieldChange('social_facebook', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">YouTube Link</label>
                    <Input 
                      name="social_youtube" 
                      defaultValue={settings.social_youtube || ''} 
                      placeholder="https://youtube.com/..." 
                      onChange={(e) => handleFieldChange('social_youtube', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Google Maps Link</label>
                    <Input 
                      name="maps_url" 
                      defaultValue={settings.maps_url || ''} 
                      placeholder="https://maps.google.com/..." 
                      onChange={(e) => handleFieldChange('maps_url', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="px-10 shadow-lg shadow-blue-500/20 font-bold" disabled={saving}>
              {saving ? 'Menyimpan Semua...' : 'Simpan Semua Perubahan'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SettingsCMS() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat editor halaman...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
