"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { ExportButtons } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { ShoppingCart, CheckCircle2, Eye } from "lucide-react";
import Pagination from "@/components/Pagination";

interface Product { id: number; name: string; hargaJual: number; stok: number; }
interface CartItem { productId: number; name: string; price: number; qty: number; }
interface Student { id: number; name: string; nis: string; }
interface Transaction { id: number; studentId: number | null; items: string; total: number; paymentMethod: string; date: string; student?: { name: string; nis: string } | null; }

export default function CoopTransactionsPage() {
  const [tab, setTab] = useState<"pos" | "riwayat">("pos");
  // POS
  const [products, setProducts] = useState<Product[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [buyerType, setBuyerType] = useState<"tunai" | "siswa">("tunai");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "bon">("tunai");
  const [processing, setProcessing] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  // Riwayat
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [selectedTrxIds, setSelectedTrxIds] = useState<number[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loadingTrx, setLoadingTrx] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    // POS needs products and students. Fetching with a large limit for POS searchability or handle with server-side search.
    // For now, handling the new API format.
    fetch("/api/coop/products?limit=100").then(r => r.json()).then(d => {
      const items = d.data || (Array.isArray(d) ? d : []);
      setProducts(items.filter((p: Product) => p.stok > 0));
    });
    fetch("/api/students?limit=1000").then(r => r.json()).then(d => {
      const items = d.data || (Array.isArray(d) ? d : []);
      setStudents(items);
    });
  }, []);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === p.id);
      if (existing) return prev.map(c => c.productId === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { productId: p.id, name: p.name, price: p.hargaJual, qty: 1 }];
    });
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(c => c.productId !== productId)); return; }
    const product = products.find(p => p.id === productId);
    if (product && qty > product.stok) { Swal.fire("Peringatan", `Stok ${product.name} hanya ${product.stok}`, "warning"); return; }
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, qty } : c));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const handleCheckout = async () => {
    if (!cart.length) { Swal.fire("Error", "Keranjang kosong", "error"); return; }
    if (buyerType === "siswa" && !selectedStudent) { Swal.fire("Error", "Pilih siswa", "error"); return; }

    setProcessing(true);
    try {
      const res = await fetch("/api/coop/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: buyerType === "siswa" ? selectedStudent : null,
          items: cart.map(c => ({ productId: c.productId, qty: c.qty, price: c.price })),
          paymentMethod: buyerType === "siswa" ? paymentMethod : "tunai",
        }),
      });
      const d = await res.json();
      if (!res.ok) { Swal.fire("Error", d.error || "Transaksi gagal", "error"); setProcessing(false); return; }
      Swal.fire("Berhasil", `Transaksi Rp ${total.toLocaleString("id-ID")} berhasil`, "success");
      setCart([]); setSelectedStudent(null); setStudentSearch(""); setBuyerType("tunai"); setPaymentMethod("tunai");
      // Refresh products
      fetch("/api/coop/products?limit=100").then(r => r.json()).then(d => {
        const items = d.data || (Array.isArray(d) ? d : []);
        setProducts(items.filter((p: Product) => p.stok > 0));
      });
    } catch { Swal.fire("Error", "Transaksi gagal", "error"); }
    setProcessing(false);
  };

  // Riwayat
  const loadTransactions = useCallback(async () => {
    setLoadingTrx(true);
    try {
      const res = await fetch(`/api/coop/transactions?date=${filterDate}&page=${page}&limit=${limit}`);
      const d = await res.json();
      if (d.data) {
        setTransactions(d.data);
        setPagination({ total: d.total, totalPages: d.totalPages });
      } else {
        setTransactions(Array.isArray(d) ? d : []);
        setPagination({ total: (Array.isArray(d) ? d.length : 0), totalPages: 1 });
      }
    } catch { /* ignore */ }
    setLoadingTrx(false);
  }, [filterDate, page, limit]);

  useEffect(() => { if (tab === "riwayat") loadTransactions(); }, [tab, loadTransactions]);

  // Reset page when filter date changes
  useEffect(() => {
    setPage(1);
  }, [filterDate]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.nis.includes(studentSearch));
  const dailyTotal = transactions.reduce((sum, t) => sum + t.total, 0);

  // Cart Form JSX (digunakan di LeftDrawer maupun panel kasir)
  const cartContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Terpilih</span>
        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{cart.length} item</span>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400">Keranjang masih kosong</p>
          <p className="text-[11px] text-slate-400 mt-1">Klik produk di daftar untuk menambah</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {cart.map(c => (
            <div key={c.productId} className="flex items-center justify-between bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                <p className="text-[11px] text-slate-500">@Rp {c.price.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(c.productId, c.qty - 1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center">−</button>
                <span className="text-xs font-bold w-6 text-center text-slate-700">{c.qty}</span>
                <button onClick={() => updateQty(c.productId, c.qty + 1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center">+</button>
              </div>
              <p className="text-xs font-extrabold text-slate-800 ml-2 w-20 text-right">Rp {(c.price * c.qty).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-slate-200 pt-4 space-y-3">
        <div className="flex justify-between items-center bg-blue-50/60 p-3 rounded-xl border border-blue-100">
          <span className="text-xs font-bold text-slate-600">Total Tagihan</span>
          <span className="text-base font-black text-blue-700">Rp {total.toLocaleString("id-ID")}</span>
        </div>

        {/* Pembeli */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe Pembeli</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setBuyerType("tunai"); setSelectedStudent(null); }}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                buyerType === "tunai" ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Umum / Tunai
            </button>
            <button
              type="button"
              onClick={() => setBuyerType("siswa")}
              className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                buyerType === "siswa" ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Siswa Madrasah
            </button>
          </div>
        </div>

        {buyerType === "siswa" && (
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cari & Pilih Siswa</label>
            <input
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              placeholder="Ketik nama atau NIS..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {studentSearch && filteredStudents.length > 0 && (
              <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {filteredStudents.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setSelectedStudent(s.id); setStudentSearch(s.name); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex justify-between ${selectedStudent === s.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"}`}
                  >
                    <span>{s.name}</span>
                    <span className="text-slate-400 font-mono">({s.nis})</span>
                  </button>
                ))}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("tunai")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === "tunai" ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Bayar Tunai
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bon")}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    paymentMethod === "bon" ? "bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-100" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Bon / Piutang
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => {
              handleCheckout();
              setIsCartDrawerOpen(false);
            }}
            disabled={processing || !cart.length}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {processing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
            <span>Proses Bayar (Rp {total.toLocaleString("id-ID")})</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Transaksi Koperasi"
        subtitle="Point of Sale & riwayat penjualan"
        icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
        actions={
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir & Keranjang</span>
            {cart.length > 0 && (
              <span className="bg-white text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        }
      />

      <Card className="p-1 flex gap-1 max-w-xs">
        <button onClick={() => setTab("pos")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "pos" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Kasir POS</button>
        <button onClick={() => setTab("riwayat")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "riwayat" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Riwayat</button>
      </Card>

      {tab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produk Grid */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 flex items-center justify-between gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk berdasarkan nama..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="lg:hidden shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Keranjang ({cart.length})
              </button>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => { addToCart(p); }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-left hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-blue-600 font-bold mt-1">Rp {p.hargaJual.toLocaleString("id-ID")}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400">Stok: {p.stok}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">+ Tambah</span>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && <div className="col-span-full text-center py-8 text-sm text-slate-400">Tidak ada produk</div>}
            </div>
          </div>

          {/* Panel Samping Keranjang (Bisa juga dibuka lewat LeftDrawer) */}
          <Card className="p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>Panel Kasir
              </h3>
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Buka Drawer
              </button>
            </div>
            {cartContent}
          </Card>
        </div>
      )}

      {tab === "riwayat" && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto" />
              <span className="text-sm text-slate-500 whitespace-nowrap">{pagination.total || transactions.length} transaksi · Total: <b className="text-blue-700">Rp {dailyTotal.toLocaleString("id-ID")}</b></span>
            </div>
            <ExportButtons 
              options={{
                title: "Riwayat Transaksi Koperasi",
                subtitle: `Tanggal: ${new Date(filterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                filename: `penjualan_koperasi_${filterDate}`,
                columns: [
                  { header: "No", key: "_no", width: 10, align: "center" },
                  { header: "Waktu", key: "date", width: 30 },
                  { header: "Pembeli", key: "buyer_name", width: 40 },
                  { header: "Total", key: "total", width: 25, align: "right", format: (v: number) => `Rp ${v.toLocaleString("id-ID")}` },
                  { header: "Metode", key: "paymentMethod", width: 20, align: "center", format: (v: string) => v.toUpperCase() },
                ],
                data: transactions.map((t, i) => ({
                  ...t,
                  _no: ((page - 1) * limit) + i + 1,
                  buyer_name: t.student?.name || "Tunai"
                }))
              }}
            />
          </Card>

          {selectedTrxIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedTrxIds.length} transaksi dipilih</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrxIds([])}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
            </div>
          )}

          {loadingTrx ? (
            <Card className="flex justify-center py-12 border-slate-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></Card>
          ) : transactions.length === 0 ? (
            <Card className="text-center py-8 border-dashed"><p className="text-sm text-slate-500">Belum ada transaksi pada tanggal ini</p></Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="px-3 py-4 border-b border-slate-200 text-center w-10">
                        <input
                          type="checkbox"
                          checked={transactions.length > 0 && selectedTrxIds.length === transactions.length}
                          onChange={(e) => setSelectedTrxIds(e.target.checked ? transactions.map(t => t.id) : [])}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label="Pilih semua transaksi"
                        />
                      </th>
                      <th className="px-4 py-4 border-b border-slate-200 text-center w-12">No</th>
                      <th className="px-6 py-4 border-b border-slate-200">Waktu & Tanggal</th>
                      <th className="px-6 py-4 border-b border-slate-200">Pembeli</th>
                      <th className="px-6 py-4 border-b border-slate-200 text-center">Jumlah Item</th>
                      <th className="px-6 py-4 border-b border-slate-200 text-right">Total</th>
                      <th className="px-6 py-4 border-b border-slate-200 text-center">Metode</th>
                      <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => {
                      const items: { productId: number; qty: number; price: number }[] = JSON.parse(t.items || "[]");
                      const isSelected = selectedTrxIds.includes(t.id);
                      return (
                        <tr key={t.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isSelected ? "bg-blue-50/40" : ""}`}>
                          <td className="px-3 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedTrxIds(prev => [...prev, t.id]);
                                else setSelectedTrxIds(prev => prev.filter(id => id !== t.id));
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center text-xs text-slate-400 font-mono">
                            {((page - 1) * limit) + i + 1}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                            {t.date}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-800">
                            {t.student ? (
                              <div>
                                <span>{t.student.name}</span>
                                <span className="block text-[10px] text-slate-400 font-normal">NIS: {t.student.nis}</span>
                              </div>
                            ) : (
                              <span className="text-slate-600">Umum / Tunai</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-xs text-slate-600 font-semibold">
                            {items.length} item
                          </td>
                          <td className="px-6 py-4 text-right text-xs font-bold text-blue-700 font-mono">
                            Rp {t.total.toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.paymentMethod === "bon" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {t.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedTrx(t)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-100 inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <Pagination
                    page={page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Drawer Panel Kasir / Checkout (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        title="Panel Kasir & Pembayaran"
        subtitle="Rincian pesanan dan proses transaksi POS"
        width="max-w-md"
      >
        {cartContent}
      </LeftDrawer>

      {/* Drawer Detail Transaksi Riwayat (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={!!selectedTrx}
        onClose={() => setSelectedTrx(null)}
        title="Detail Transaksi Koperasi"
        subtitle={selectedTrx ? `Nota #${selectedTrx.id} · ${selectedTrx.date}` : ""}
        width="max-w-md"
      >
        {selectedTrx && (() => {
          const items: { productId: number; name?: string; qty: number; price: number }[] = JSON.parse(selectedTrx.items || "[]");
          return (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pembeli:</span>
                  <span className="font-bold text-slate-700">{selectedTrx.student?.name || "Umum / Tunai"}</span>
                </div>
                {selectedTrx.student?.nis && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">NIS Siswa:</span>
                    <span className="font-mono text-slate-600">{selectedTrx.student.nis}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Metode Pembayaran:</span>
                  <span className={`font-bold uppercase ${selectedTrx.paymentMethod === 'bon' ? 'text-amber-600' : 'text-emerald-600'}`}>{selectedTrx.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Transaksi:</span>
                  <span className="text-slate-600">{selectedTrx.date}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rincian Barang</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {items.map((it, idx) => {
                    const prodName = it.name || products.find(p => p.id === it.productId)?.name || `Produk #${it.productId}`;
                    return (
                      <div key={idx} className="p-3 flex justify-between items-center text-xs bg-white">
                        <div>
                          <p className="font-bold text-slate-800">{prodName}</p>
                          <p className="text-[11px] text-slate-400">{it.qty} x Rp {it.price.toLocaleString("id-ID")}</p>
                        </div>
                        <p className="font-bold text-slate-700 font-mono">Rp {(it.qty * it.price).toLocaleString("id-ID")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-slate-600">Total Pembayaran</span>
                <span className="text-base font-black text-blue-700 font-mono">Rp {selectedTrx.total.toLocaleString("id-ID")}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrx(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })()}
      </LeftDrawer>
    </div>
  );
}
