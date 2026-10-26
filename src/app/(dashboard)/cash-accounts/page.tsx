"use client";
import { useState, Suspense, useCallback } from "react";
import { Plus, Search, Filter, Download, CreditCard, MoreHorizontal, Pencil, Trash2, Building2, Hash, ShieldCheck, LayoutGrid, ArrowUpRight, Wallet, Landmark, AlertCircle, RefreshCcw, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
import LeftDrawer from "@/components/ui/LeftDrawer";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

interface CashAccount {
  id: number;
  accountName: string;
  accountNumber: string | null;
  bankName: string | null;
  balance: number;
  status: string;
  transactionCount: number;
}

export default function CashAccountsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CashAccountsContent />
    </Suspense>
  );
}

function CashAccountsContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    status: "active",
  });

  const queryString = searchParams.toString();

  const { data: cashAccountsQuery, isLoading: loading, refetch, isFetching } = useQuery({
    queryKey: ["cash-accounts", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/cash-accounts?${queryString}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const items: CashAccount[] = cashAccountsQuery?.success ? cashAccountsQuery.data || [] : [];

  const refreshCashAccounts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
    queryClient.invalidateQueries({ queryKey: ["cash-account-options"] });
  }, [queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountName) return Toast.fire({ icon: 'error', title: "Nama Akun wajib diisi" });

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/cash-accounts", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      const data = await res.json();

      if (data.success) {
        Toast.fire({ icon: 'success', title: data.message || (editingId ? "Berhasil diperbarui" : "Berhasil ditambahkan") });
        setModalOpen(false);
        setEditingId(null);
        setForm({ accountName: "", accountNumber: "", bankName: "", status: "active" });
        refreshCashAccounts();
      } else {
        Toast.fire({ icon: 'error', title: data.message || "Terjadi kesalahan" });
      }
    } catch {
      Toast.fire({ icon: 'error', title: "Gagal menyimpan data" });
    }
  };

  const deleteItem = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Akun "${name}" akan dihapus secara soft-delete.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4ed8',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/cash-accounts`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.success) {
          Toast.fire({ icon: 'success', title: "Akun berhasil dihapus" });
          refreshCashAccounts();
        }
      } catch {
        Toast.fire({ icon: 'error', title: "Gagal menghapus data" });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: 'Hapus Akun Kas Terpilih?',
      text: `${selectedIds.length} akun kas terpilih akan dihapus secara soft-delete.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Ya, Hapus (${selectedIds.length})`,
      cancelButtonText: 'Batal',
    });
    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedIds.map(id =>
            fetch("/api/cash-accounts", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            })
          )
        );
        Toast.fire({ icon: 'success', title: `${selectedIds.length} akun kas berhasil dihapus` });
        setSelectedIds([]);
        refreshCashAccounts();
      } catch {
        Toast.fire({ icon: 'error', title: "Gagal menghapus beberapa akun" });
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.bankName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'active').length,
    totalBalance: items.reduce((acc, curr) => acc + (curr.balance || 0), 0)
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Finansial & Kas
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manajemen Akun Kas</h1>
          <p className="text-slate-500 max-w-2xl">
            Kelola metode pembayaran dan rekening bank sekolah untuk pencatatan transaksi yang lebih akurat dan transparan.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { void refetch(); }}
            className="p-3 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCcw className={`w-5 h-5 ${(loading || isFetching) ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ accountName: "", accountNumber: "", bankName: "", status: "active" });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tambah Akun Baru
          </button>
        </div>
      </div>

      <FilterBar />


      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24 text-slate-900" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Total Saldo Tergabung</p>
          <h3 className="text-3xl font-black text-slate-900">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats.totalBalance)}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 w-fit px-3 py-1 rounded-full">
            <ArrowUpRight className="w-4 h-4" />
            Real-time Sync
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <LayoutGrid className="w-24 h-24 text-slate-900" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Total Akun</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.total} Akun</h3>
          <div className="mt-4 text-slate-400 text-sm font-medium">
            {stats.active} akun aktif saat ini
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Landmark className="w-24 h-24 text-slate-900" />
          </div>
          <p className="text-slate-500 font-medium mb-1 truncate">Akun Teraktif</p>
          <h3 className="text-2xl font-bold text-slate-900 truncate">
            {items.length > 0 ? items.sort((a,b) => b.transactionCount - a.transactionCount)[0].accountName : 'N/A'}
          </h3>
          <p className="mt-4 text-slate-600 text-sm font-medium">
            Mencatat {items.length > 0 ? items.sort((a,b) => b.transactionCount - a.transactionCount)[0].transactionCount : 0} transaksi
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Cari nama akun atau bank..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-400 text-slate-700 font-medium transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold transition-hover hover:bg-slate-100 active:bg-slate-200">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold transition-hover hover:bg-slate-100 active:bg-slate-200">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mx-6 my-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-blue-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{selectedIds.length} akun kas dipilih</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Account Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? filteredItems.map(i => i.id) : [])}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label="Pilih semua akun"
                  />
                </th>
                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-14">No</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Detail Akun</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Rekening</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-100 rounded w-1/3 opacity-50"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <p className="font-bold">Data tidak ditemukan</p>
                      <p className="text-sm">Coba kata kunci lain atau tambah akun baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, i) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="px-6 py-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih akun ${item.accountName}`}
                        />
                      </td>
                      <td className="px-4 py-6 text-center text-xs font-mono font-bold text-slate-400">{i + 1}</td>
                      <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-sm">
                          {item.bankName ? <Landmark className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{item.accountName}</p>
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                            <Hash className="w-3 h-3" />
                            <span>ID: KAS-{item.id.toString().padStart(4, '0')}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span>{item.transactionCount} Transaksi</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center text-center">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">{item.bankName || 'KAS TUNAI'}</p>
                        <p className="text-xs font-medium text-slate-400 font-mono tracking-tighter">{item.accountNumber || '-'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.status === 'active' ? 'AKTIF' : 'NON-AKTIF'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="font-black text-slate-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.balance)}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setForm({
                              accountName: item.accountName,
                              accountNumber: item.accountNumber || "",
                              bankName: item.bankName || "",
                              status: item.status,
                            });
                            setModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id, item.accountName)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg shadow-sm transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="p-2 text-slate-400 group-hover:hidden">
                         <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ); })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Akun Kas (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Update Akun" : "Registrasi Akun"}
        subtitle="Lengkapi parameter akun kas dengan benar."
        width="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nama Identitas Akun</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="Contoh: Kas Utama Bendahara"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400"
                value={form.accountName}
                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nama Bank (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="BSI / Mandiri / dll"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nomor Rekening</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Hash className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Masukan angka saja"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status Operasi</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({...form, status: 'active'})}
                className={`py-3 rounded-2xl font-black text-xs uppercase border-2 transition-all ${
                  form.status === 'active' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50' 
                  : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setForm({...form, status: 'inactive'})}
                className={`py-3 rounded-2xl font-black text-xs uppercase border-2 transition-all ${
                  form.status === 'inactive' 
                  ? 'bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50' 
                  : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                Non-Aktif
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 px-6 rounded-xl text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 transition-all border border-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
