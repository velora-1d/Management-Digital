'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ImageUpload from '@/components/ui/ImageUpload';
import { ensureHttpsUrl } from '@/lib/url';
import Image from 'next/image';
import Swal from 'sweetalert2';

interface Achievement {
  id?: number;
  title: string;
  description?: string;
  year: number;
  category?: string;
  status?: string;
  order?: number;
  studentName?: string;
  student_name?: string; // Fallback
  competitionName?: string;
  competition_name?: string; // Fallback
  level?: string;
  imageUrl?: string;
  image_url?: string; // Fallback
}

export default function AchievementsCMS() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Achievement | null>(null);

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/cms/achievements');
      const data = await res.json();
      if (data.success) {
        setAchievements(data.data as Achievement[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload: Achievement = {
      id: editing?.id,
      title: data.title as string,
      year: Number(data.year),
      category: data.category as string,
      status: data.status as string,
      order: Number(data.order),
      description: data.description as string,
      studentName: (data.student_name || data.studentName) as string,
      competitionName: (data.competition_name || data.competitionName) as string,
      level: data.level as string,
      imageUrl: (data.image_url || data.imageUrl) as string,
    };

    try {
      const res = await fetch('/api/cms/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire('Berhasil', result.message, 'success');
        setEditing(null);
        fetchAchievements();
      } else {
        Swal.fire('Gagal', result.message, 'error');
      }
    } catch {
      Swal.fire('Error', 'Terjadi kesalahan server', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus prestasi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/cms/achievements?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          Swal.fire('Terhapus', data.message, 'success');
          fetchAchievements();
        }
      } catch {
        Swal.fire('Error', 'Gagal menghapus prestasi', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul Prestasi Sekolah</h1>
          <p className="text-slate-500">Kelola daftar prestasi yang diraih sekolah & siswa.</p>
        </div>
        <Button onClick={() => setEditing({ title: '', year: new Date().getFullYear(), category: 'Akademik', status: 'aktif', order: 0 })}>
          + Tambah Prestasi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-20 text-center text-slate-400 italic">Memuat data prestasi...</div>
        ) : achievements.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-slate-400 italic">Belum ada data prestasi.</div>
        ) : achievements.map((ach) => (
          <div key={ach.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <Image 
                src={ensureHttpsUrl((ach.imageUrl || ach.image_url) || 'https://via.placeholder.com/600x400')} 
                alt={ach.title} 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="info">{ach.year}</Badge>
                <Badge variant={ach.status === 'aktif' ? 'success' : 'neutral'}>{ach.status}</Badge>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1">{ach.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{ach.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info" className="text-[10px]">{ach.category}</Badge>
                {ach.level && <Badge variant="info" className="text-[10px]">{ach.level}</Badge>}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => setEditing(ach)}
                className="flex-1 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(ach.id!)}
                className="px-3 py-2 bg-slate-50 text-rose-600 font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-colors text-sm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editing.id ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Judul Prestasi</label>
                  <Input name="title" defaultValue={editing.title} required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tahun</label>
                  <Input type="number" name="year" defaultValue={editing.year} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Siswa / Tim</label>
                  <Input name="student_name" defaultValue={editing.student_name || editing.studentName} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lomba</label>
                  <Input name="competition_name" defaultValue={editing.competition_name || editing.competitionName} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Level</label>
                  <select name="level" defaultValue={editing.level} className="w-full h-11 border border-slate-300 rounded-xl px-4 outline-none">
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kota/Kab">Kota/Kab</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                  <select name="category" defaultValue={editing.category} className="w-full h-11 border border-slate-300 rounded-xl px-4 outline-none">
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik</option>
                    <option value="Seni">Seni</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Keagamaan">Keagamaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editing.status} className="w-full h-11 border border-slate-300 rounded-xl px-4 outline-none">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Gambar Piagam/Foto (Wajib Upload)</label>
                <ImageUpload name="image_url" defaultValue={editing.image_url || editing.imageUrl} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea name="description" defaultValue={editing.description} rows={2} className="w-full border border-slate-300 rounded-xl p-4 outline-none" required />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-50">
                <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Batal</Button>
                <Button type="submit">Simpan Data</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
