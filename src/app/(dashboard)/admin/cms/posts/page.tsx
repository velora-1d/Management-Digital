'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ImageUpload from '@/components/ui/ImageUpload';
import LeftDrawer from '@/components/ui/LeftDrawer';
import Swal from 'sweetalert2';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface Post {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnailUrl?: string; 
  thumbnail_url?: string; // Fallback for form data
  category?: string;
  status?: string;
  publishedAt?: Date | string;
}

export default function PostsCMS() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/cms/posts');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data as Post[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
      ...data,
      thumbnailUrl: (data.thumbnail_url || data.thumbnailUrl) as string,
      id: editing?.id,
    };

    if (data.publishedAt) {
      // @ts-expect-error - payload type is dynamic
      payload.publishedAt = new Date(data.publishedAt as string);
    }

    try {
      const res = await fetch('/api/cms/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire('Berhasil', result.message, 'success');
        setEditing(null);
        fetchPosts();
      } else {
        Swal.fire('Gagal', result.message, 'error');
      }
    } catch {
      Swal.fire('Error', 'Terjadi kesalahan server', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus berita ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/cms/posts?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          Swal.fire('Terhapus', data.message, 'success');
          fetchPosts();
        }
      } catch {
        Swal.fire('Error', 'Gagal menghapus berita', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.length === 0) return;
    const result = await Swal.fire({
      title: `Hapus ${selectedPostIds.length} berita terpilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Masal',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48'
    });
    if (result.isConfirmed) {
      try {
        await Promise.all(selectedPostIds.map(id => fetch(`/api/cms/posts?id=${id}`, { method: 'DELETE' })));
        Swal.fire('Terhapus', `${selectedPostIds.length} berita berhasil dihapus`, 'success');
        setSelectedPostIds([]);
        fetchPosts();
      } catch {
        Swal.fire('Error', 'Gagal menghapus sebagian berita', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul Berita</h1>
          <p className="text-slate-500">Kelola artikel, berita, dan pengumuman website.</p>
        </div>
        <Button onClick={() => setEditing({ title: '', slug: '', content: '', status: 'published' })}>
          + Buat Berita Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {selectedPostIds.length > 0 && (
          <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{selectedPostIds.length} berita dipilih</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
              <button
                type="button"
                onClick={() => setSelectedPostIds([])}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-4 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={posts.length > 0 && selectedPostIds.length === posts.length}
                  onChange={(e) => setSelectedPostIds(e.target.checked ? posts.map((p) => p.id!).filter(Boolean) : [])}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  aria-label="Pilih semua berita"
                />
              </th>
              <th className="px-4 py-4 font-bold text-slate-700 text-center w-12">No</th>
              <th className="px-6 py-4 font-bold text-slate-700">Judul</th>
              <th className="px-6 py-4 font-bold text-slate-700">Kategori</th>
              <th className="px-6 py-4 font-bold text-slate-700">Status</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">Memuat data...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">Belum ada berita.</td></tr>
            ) : posts.map((post, i: number) => {
              const isSelected = selectedPostIds.includes(post.id!);
              return (
              <tr key={post.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                <td className="py-4 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPostIds(prev => [...prev, post.id!]);
                      else setSelectedPostIds(prev => prev.filter(id => id !== post.id));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label={`Pilih ${post.title}`}
                  />
                </td>
                <td className="px-4 py-4 text-center text-xs font-mono font-medium text-slate-400">{i + 1}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{post.title}</td>
                <td className="px-6 py-4 text-slate-600">{post.category || '-'}</td>
                <td className="px-6 py-4">
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                    {post.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => setEditing(post)} className="text-blue-600 hover:text-blue-900 font-bold">Edit</button>
                  <button onClick={() => handleDelete(post.id!)} className="text-rose-600 hover:text-rose-900 font-bold">Hapus</button>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      <LeftDrawer
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit Berita' : 'Buat Berita Baru'}
        subtitle="Formulir publikasi berita dan artikel website madrasah"
        width="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Berita <span className="text-rose-500">*</span>
            </label>
            <Input name="title" defaultValue={editing?.title} required placeholder="Contoh: Kegiatan Pondok Ramadhan" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Slug (URL)</label>
              <Input name="slug" defaultValue={editing?.slug} required placeholder="kegiatan-pondok-ramadhan" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kategori</label>
              <select name="category" defaultValue={editing?.category || "Berita"} className="w-full h-10 border border-slate-200 rounded-xl px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-slate-800 text-sm">
                <option value="Berita">Berita</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Artikel">Artikel</option>
                <option value="Kesiswaan">Kesiswaan</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select name="status" defaultValue={editing?.status || "published"} className="w-full h-10 border border-slate-200 rounded-xl px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-slate-800 text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Thumbnail Gambar</label>
              <ImageUpload name="thumbnail_url" defaultValue={editing?.thumbnail_url || editing?.thumbnailUrl} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Konten Berita</label>
            <textarea 
              name="content" 
              defaultValue={editing?.content} 
              required 
              rows={8}
              className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-slate-800 text-sm resize-none"
              placeholder="Tulis berita di sini (suport Markdown)..."
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Batal</Button>
            <Button type="submit">Simpan Berita</Button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
