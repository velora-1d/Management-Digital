'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ImageUpload from '@/components/ui/ImageUpload';
import LeftDrawer from '@/components/ui/LeftDrawer';
import { ensureHttpsUrl } from '@/lib/url';
import Swal from 'sweetalert2';

import Image from 'next/image';

interface Hero {
  id?: number;
  title: string;
  subtitle?: string;
  mediaType?: string;
  mediaUrl: string;
  ctaText?: string;
  ctaUrl?: string;
  order?: number;
  status?: string;
  // Fallback for current mismatched usage in page if needed
  image_url?: string;
  action_text?: string;
  action_url?: string;
}

export default function HeroesCMS() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Hero | null>(null);

  const fetchHeroesSorted = async () => {
    try {
      const res = await fetch('/api/cms/heroes');
      const data = await res.json();
      if (data.success) {
        setHeroes(data.data as Hero[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroesSorted();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = { 
      id: editing?.id, 
      title: data.title as string,
      subtitle: data.subtitle as string,
      mediaUrl: (data.image_url || data.mediaUrl) as string,
      ctaText: (data.action_text || data.ctaText) as string,
      ctaUrl: (data.action_url || data.ctaUrl) as string,
      order: Number(data.order)
    };

    try {
      const res = await fetch('/api/cms/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire('Berhasil', result.message, 'success');
        setEditing(null);
        fetchHeroesSorted();
      } else {
        Swal.fire('Gagal', result.message, 'error');
      }
    } catch {
      Swal.fire('Error', 'Terjadi kesalahan server', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus slide hero ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/cms/heroes?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          Swal.fire('Terhapus', data.message, 'success');
          fetchHeroesSorted();
        }
      } catch {
        Swal.fire('Error', 'Gagal menghapus banner', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul Banner Hero</h1>
          <p className="text-slate-500">Kelola gambar banner utama di halaman beranda profil.</p>
        </div>
        <Button onClick={() => setEditing({ title: '', subtitle: '', mediaUrl: '', ctaText: '', ctaUrl: '', order: 0 })}>
          + Tambah Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-20 text-center text-slate-400 italic">Memuat data banner...</div>
        ) : heroes.length === 0 ? (
          <div className="col-span-2 py-20 text-center text-slate-400 italic">Belum ada banner.</div>
        ) : heroes.map((hero) => (
          <div key={hero.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="relative aspect-video bg-slate-900">
              <Image 
                src={ensureHttpsUrl((hero.mediaUrl || hero.image_url) || 'https://via.placeholder.com/1280x720')} 
                alt={hero.title} 
                fill
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8">
                <Badge variant="info" className="mb-3 w-fit">Order: {hero.order}</Badge>
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{hero.title}</h3>
                <p className="text-slate-300 text-sm line-clamp-2 max-w-md">{hero.subtitle}</p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => setEditing(hero)}
                  className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 rounded-xl shadow-md transition-colors"
                  title="Edit Banner"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button 
                  onClick={() => handleDelete(hero.id!)}
                  className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 rounded-xl shadow-md transition-colors"
                  title="Hapus Banner"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <LeftDrawer
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Banner' : 'Tambah Banner Baru'}
        subtitle="Formulir konfigurasi banner slideshow beranda madrasah"
        width="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Judul Utama <span className="text-rose-500">*</span></label>
              <Input name="title" defaultValue={editing?.title} required placeholder="Contoh: Selamat Datang" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Urutan Tampil</label>
              <Input type="number" name="order" defaultValue={editing?.order ?? 1} required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Subtitle / Penjelasan</label>
            <textarea 
              name="subtitle" 
              defaultValue={editing?.subtitle} 
              rows={2} 
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white text-slate-800 resize-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Gambar Banner</label>
            <ImageUpload name="image_url" defaultValue={editing?.image_url || editing?.mediaUrl} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Teks Tombol (Opsional)</label>
              <Input name="action_text" defaultValue={editing?.action_text || editing?.ctaText} placeholder="Contoh: Daftar Sekarang" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">URL Tujuan Tombol</label>
              <Input name="action_url" defaultValue={editing?.action_url || editing?.ctaUrl} placeholder="Contoh: /daftar" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Batal</Button>
            <Button type="submit">Simpan Banner</Button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
