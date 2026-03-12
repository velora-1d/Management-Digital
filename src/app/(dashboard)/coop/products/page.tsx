"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import { ExportButtons } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { ShoppingBag } from "lucide-react";
import Pagination from "@/components/Pagination";

interface Product { id: number; name: string; category: string; hargaJual: number; hargaBeli: number; stok: number; minStok: number; status: string; }

const categoryOptions = ["Alat Tulis", "Makanan", "Minuman", "Seragam", "Buku", "Lainnya"];

export default function CoopProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", category: "", hargaJual: "", hargaBeli: "", stok: "", minStok: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coop/products?page=${page}&limit=${limit}`);
      const d = await res.json();
      if (d.data) {
        setData(d.data);
        setPagination({ total: d.total, totalPages: d.totalPages });
      } else {
        setData(Array.isArray(d) ? d : []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSubmit = async () => {
    if (!form.name) { Swal.fire("Error", "Nama produk wajib", "error"); return; }
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `/api/coop/products/${editItem.id}` : "/api/coop/products";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setEditItem(null);
    setForm({ name: "", category: "", hargaJual: "", hargaBeli: "", stok: "", minStok: "" });
    fetchData();
    Swal.fire("Berhasil", editItem ? "Produk diperbarui" : "Produk ditambahkan", "success");
  };

  const handleDelete = async (id: number) => {
    const r = await Swal.fire({ title: "Hapus produk?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus" });
    if (!r.isConfirmed) return;
    await fetch(`/api/coop/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: Product) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, hargaJual: String(item.hargaJual), hargaBeli: String(item.hargaBeli), stok: String(item.stok), minStok: String(item.minStok) });
    setShowModal(true);
  };

  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));
  const lowStockCount = data.filter(d => d.stok <= d.minStok && d.stok > 0).length;
  const outStockCount = data.filter(d => d.stok === 0).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Produk Koperasi"
        subtitle="Kelola stok dan harga produk"
        icon={<ShoppingBag />}
        gradient="from-indigo-500 to-blue-600"
        actions={
          <div className="flex gap-2">
            <button onClick={() => { setEditItem(null); setForm({ name: "", category: "", hargaJual: "", hargaBeli: "", stok: "", minStok: "" }); setShowModal(true); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/30 backdrop-blur-md cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah Produk
            </button>
            <ExportButtons 
              options={{
                title: "Daftar Produk Koperasi",
                subtitle: `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                filename: `produk_koperasi_${new Date().toISOString().split("T")[0]}`,
                columns: [
                  { header: "No", key: "_no", width: 10, align: "center" },
                  { header: "Nama Produk", key: "name", width: 50 },
                  { header: "Kategori", key: "category", width: 30 },
                  { header: "H. Beli", key: "hargaBeli", width: 20, align: "right", format: (v: number) => `Rp ${v.toLocaleString("id-ID")}` },
                  { header: "H. Jual", key: "hargaJual", width: 20, align: "right", format: (v: number) => `Rp ${v.toLocaleString("id-ID")}` },
                  { header: "Stok", key: "stok", width: 15, align: "center" },
                  { header: "Min Stok", key: "minStok", width: 15, align: "center" },
                ],
                data: data.map((d, i) => ({
                  ...d,
                  _no: ((page - 1) * limit) + i + 1
                }))
              }}
            />
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-[11px] text-slate-500 uppercase tracking-wider">Total Produk</p><p className="text-2xl font-bold text-slate-800 mt-1">{pagination.total || data.length}</p></Card>
        <Card className="p-4"><p className="text-[11px] text-slate-500 uppercase tracking-wider">Stok Rendah</p><p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p></Card>
        <Card className="p-4"><p className="text-[11px] text-slate-500 uppercase tracking-wider">Habis</p><p className="text-2xl font-bold text-rose-600 mt-1">{outStockCount}</p></Card>
        <Card className="p-4"><p className="text-[11px] text-slate-500 uppercase tracking-wider">Kategori</p><p className="text-2xl font-bold text-indigo-600 mt-1">{new Set(data.map(d => d.category).filter(Boolean)).size}</p></Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full md:w-72 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
      </Card>

      {loading ? (
        <Card className="flex justify-center items-center h-64 border-gray-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 border-dashed"><p className="text-sm text-slate-500">Tidak ada produk</p></Card>
      ) : (
        <>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4">Produk</th><th className="py-3 px-4">Kategori</th><th className="py-3 px-4 text-right">H. Beli</th><th className="py-3 px-4 text-right">H. Jual</th><th className="py-3 px-4 text-center">Stok</th><th className="py-3 px-4"></th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((item, idx) => {
                    const isLow = item.stok <= item.minStok && item.stok > 0;
                    const isOut = item.stok === 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        </td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">{item.category || "-"}</span></td>
                        <td className="py-3 px-4 text-right text-xs text-slate-500">Rp {item.hargaBeli.toLocaleString("id-ID")}</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-slate-800">Rp {item.hargaJual.toLocaleString("id-ID")}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isOut ? "bg-rose-100 text-rose-700" : isLow ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {item.stok}
                          </span>
                          {isLow && <span className="ml-1 text-[9px] text-amber-500">⚠️ rendah</span>}
                          {isOut && <span className="ml-1 text-[9px] text-rose-500">❌ habis</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleEdit(item)} className="px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-[11px] font-semibold transition-colors">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-[11px] font-semibold transition-colors">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">{editItem ? "Edit Produk" : "Tambah Produk"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-slate-600">Nama Produk *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600">Kategori</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">— Pilih —</option>
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-600">Harga Beli</label>
                  <input type="number" value={form.hargaBeli} onChange={e => setForm({ ...form, hargaBeli: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="text-xs font-semibold text-slate-600">Harga Jual</label>
                  <input type="number" value={form.hargaJual} onChange={e => setForm({ ...form, hargaJual: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-slate-600">Stok</label>
                  <input type="number" value={form.stok} onChange={e => setForm({ ...form, stok: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="text-xs font-semibold text-slate-600">Min Stok (alert)</label>
                  <input type="number" value={form.minStok} onChange={e => setForm({ ...form, minStok: e.target.value })} className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
