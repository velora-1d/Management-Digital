"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { exportCSV } from "@/lib/csv-export";
import { ExportButtons } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { ShoppingCart } from "lucide-react";
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
  // Riwayat
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Transaksi Koperasi"
        subtitle="Point of Sale & riwayat penjualan"
        icon={<ShoppingCart />}
        gradient="from-indigo-500 to-blue-600"
      />

      <Card className="p-1 flex gap-1 max-w-xs">
        <button onClick={() => setTab("pos")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "pos" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Kasir</button>
        <button onClick={() => setTab("riwayat")} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "riwayat" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>Riwayat</button>
      </Card>

      {tab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produk */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 text-left hover:border-indigo-300 hover:shadow-md transition-all group">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-1">Rp {p.hargaJual.toLocaleString("id-ID")}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Stok: {p.stok}</p>
                </button>
              ))}
              {filteredProducts.length === 0 && <div className="col-span-full text-center py-8 text-sm text-slate-400">Tidak ada produk</div>}
            </div>
          </div>

          {/* Keranjang */}
          <Card className="p-5 h-fit sticky top-4 space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>Keranjang
              {cart.length > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{cart.length}</span>}
            </h3>

            {cart.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Pilih produk untuk ditambah</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {cart.map(c => (
                  <div key={c.productId} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400">@Rp {c.price.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(c.productId, c.qty - 1)} className="w-6 h-6 rounded bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">−</button>
                      <span className="text-xs font-semibold w-6 text-center">{c.qty}</span>
                      <button onClick={() => updateQty(c.productId, c.qty + 1)} className="w-6 h-6 rounded bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">+</button>
                    </div>
                    <p className="text-xs font-bold text-slate-800 ml-2 w-20 text-right">Rp {(c.price * c.qty).toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div className="flex justify-between"><span className="text-sm font-medium text-slate-600">Total</span><span className="text-lg font-bold text-indigo-700">Rp {total.toLocaleString("id-ID")}</span></div>

              {/* Pembeli */}
              <div className="flex gap-1">
                <button onClick={() => { setBuyerType("tunai"); setSelectedStudent(null); }} className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all ${buyerType === "tunai" ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>Tunai</button>
                <button onClick={() => setBuyerType("siswa")} className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all ${buyerType === "siswa" ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-400"}`}>Siswa</button>
              </div>

              {buyerType === "siswa" && (
                <>
                  <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Cari siswa..." className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
                  {studentSearch && filteredStudents.length > 0 && (
                    <div className="max-h-28 overflow-y-auto border border-slate-100 rounded">
                      {filteredStudents.slice(0, 5).map(s => (
                        <button key={s.id} onClick={() => { setSelectedStudent(s.id); setStudentSearch(s.name); }}
                          className={`w-full text-left px-2 py-1.5 text-xs hover:bg-indigo-50 ${selectedStudent === s.id ? "bg-indigo-50 text-indigo-700" : ""}`}>
                          {s.name} <span className="text-slate-400">({s.nis})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => setPaymentMethod("tunai")} className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all ${paymentMethod === "tunai" ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>Bayar Tunai</button>
                    <button onClick={() => setPaymentMethod("bon")} className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all ${paymentMethod === "bon" ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-400"}`}>Bon / Hutang</button>
                  </div>
                </>
              )}

              <button onClick={handleCheckout} disabled={processing || !cart.length}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {processing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                Bayar
              </button>
            </div>
          </Card>
        </div>
      )}

      {tab === "riwayat" && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto" />
              <span className="text-sm text-slate-500 whitespace-nowrap">{pagination.total || transactions.length} transaksi · Total: <b className="text-indigo-700">Rp {dailyTotal.toLocaleString("id-ID")}</b></span>
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

          {loadingTrx ? (
            <Card className="flex justify-center py-12 border-slate-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></Card>
          ) : transactions.length === 0 ? (
            <Card className="text-center py-8 border-dashed"><p className="text-sm text-slate-500">Belum ada transaksi hari ini</p></Card>
          ) : (
            <div className="space-y-2">
              {transactions.map(t => {
                const items: { productId: number; qty: number; price: number }[] = JSON.parse(t.items || "[]");
                return (
                  <Card key={t.id} className="p-4 hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Rp {t.total.toLocaleString("id-ID")}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.date} · {items.length} item</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{t.student?.name || "Tunai"}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${t.paymentMethod === "bon" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{t.paymentMethod}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    page={page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
