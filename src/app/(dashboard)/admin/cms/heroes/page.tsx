'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ImageUpload from '@/components/ui/ImageUpload';
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
                  className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-indigo-600 transition-colors"
                  title="Edit Banner"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(hero.id!)}
                  className="p-3 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-rose-600 transition-colors"
                  title="Hapus Banner"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold font-display">{editing.id ? 'Edit Banner' : 'Tambah Banner Baru'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Judul Utama</label>
                  <Input name="title" defaultValue={editing.title} required placeholder="Contoh: Selamat Datang" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Urutan Tampil</label>
                  <Input type="number" name="order" defaultValue={editing.order} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Subtitle / Penjelasan</label>
                <textarea 
                  name="subtitle" 
                  defaultValue={editing.subtitle} 
                  rows={2} 
                  className="w-full border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Gambar Banner</label>
                <ImageUpload name="image_url" defaultValue={editing.image_url} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Teks Tombol (Opsional)</label>
                  <Input name="action_text" defaultValue={editing.action_text} placeholder="Contoh: Daftar Sekarang" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">URL Tujuan Tombol</label>
                  <Input name="action_url" defaultValue={editing.action_url} placeholder="Contoh: /daftar" />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-slate-50">
                <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Batal</Button>
                <Button type="submit">Simpan Banner</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
