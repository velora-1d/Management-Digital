"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";

export default function ReRegistrationPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [paymentStats, setPaymentStats] = useState<any>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Row Action Dropdown state
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside() {
      setOpenActionId(null);
    }
    if (openActionId !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    re_registration_fee: 0,
    books_fee: 0,
  });
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTarget, setPayTarget] = useState<{ regId: string; field: string; amount: number } | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payCashId, setPayCashId] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reregistration");
      const json = await res.json();
      setData(json.data || []);
      setStats({
        total: json.total || 0,
        confirmed: json.confirmed || 0,
        pending: json.pending || 0,
        not_registered: json.not_registered || 0,
      });
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Gagal load data daftar ulang", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/reregistration/settings");
      const json = await res.json();
      setSettings({
        re_registration_fee: json.re_registration_fee || 0,
        books_fee: json.books_fee || 0,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const res = await fetch("/api/reregistration/stats");
      const json = await res.json();
      setPaymentStats(json);
    } catch (e) {
      console.error(e);
    }
  };

  async function loadCashAccounts() {
    try {
      const res = await fetch("/api/cash-accounts");
      const json = await res.json();
      if (json.success) setCashAccounts(json.data || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    loadSettings();
    loadData();
    loadPaymentStats();
    loadCashAccounts();
  }, []);

  const saveSettings = async () => {
    try {
      const res = await fetch("/api/reregistration/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: data.message,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000
        });
        loadData();
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menyimpan pengaturan", "error");
    }
  };

  const generateData = () => {
    Swal.fire({
      title: "Generate Batch?",
      text: "Ini akan membuat data daftar ulang untuk semua siswa aktif.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Generate",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Memproses...", didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch("/api/reregistration/generate", { method: "POST" });
          const json = await res.json();
          Swal.close();
          if (res.ok && json.success) {
            Swal.fire("Berhasil", json.message, "success");
            loadData();
            loadPaymentStats();
          } else {
            Swal.fire("Gagal", json.error || "Gagal generate data", "error");
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const updateStatus = (id: number, status: string) => {
    const label = status === "confirmed" ? "mengkonfirmasi" : status === "not_registered" ? "menolak daftar ulang" : "membatalkan status";
    Swal.fire({
      title: "Konfirmasi",
      text: `Yakin ingin ${label} siswa ini?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/reregistration/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
          });
          const json = await res.json();
          if (res.ok && json.success) {
            Swal.fire({ icon: "success", title: "Berhasil", text: "Status diperbarui", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
            loadData();
          } else {
            Swal.fire("Gagal", json.error || "Error", "error");
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  // Field yang melibatkan uang (butuh modal konfirmasi)
  const monetaryFields = ['is_fee_paid', 'is_books_paid'];

  const openPayModal = (regId: string, field: string, amount: number) => {
    // Cek apakah field ini sekarang true (mau revert)
    const item = data.find(d => d.id.toString() === regId);
    if (item?.payment?.[field]) {
      // Sudah bayar → revert langsung
      Swal.fire({
        title: "Batalkan Pembayaran?",
        text: "Jurnal terkait akan di-void dan saldo kas dikembalikan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Revert",
        cancelButtonText: "Batal"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await togglePayment(regId, field, amount, undefined);
        }
      });
      return;
    }
    setPayTarget({ regId, field, amount });
    setPayAmount(String(amount || 0));
    setPayCashId("");
    setShowPayModal(true);
  };

  const handlePayConfirm = async () => {
    if (!payTarget) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) {
      Swal.fire("Error", "Nominal harus lebih dari 0", "error");
      return;
    }
    setPayLoading(true);
    await togglePayment(payTarget.regId, payTarget.field, amt, payCashId ? Number(payCashId) : undefined);
    setShowPayModal(false);
    setPayTarget(null);
    setPayLoading(false);
  };

  const togglePayment = async (regId: string, field: string, amount: number, cashAccountId?: number) => {
    try {
      const res = await fetch("/api/reregistration/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId, field, amount, cashAccountId })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // Fast UI update
        setData(prev => prev.map(item => {
          if (item.id.toString() === regId) {
            return {
              ...item,
              payment: {
                ...item.payment,
                [field]: json.newState
              }
            };
          }
          return item;
        }));
        loadPaymentStats();
        
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: json.message,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (e) {
      Swal.fire("Error", "Gagal menyimpan pembayaran", "error");
    }
  };

  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-20 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="p-8 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl text-white m-0">Pendaftaran Ulang Siswa</h2>
                <p className="text-sm text-white/80 mt-1">Kelola konfirmasi daftar ulang siswa untuk tahun ajaran baru.</p>
              </div>
            </div>
            <div>
              <button onClick={generateData} className="inline-flex items-center px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-wider border border-white/30 transition-all shadow-sm hover:shadow-md">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Generate Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all">
        <button 
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center justify-between p-5 bg-gradient-to-br from-violet-50 to-slate-50 hover:from-violet-100 hover:to-slate-100 transition-colors border-b border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Pengaturan & Rekap Daftar Ulang</h4>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Atur biaya daftar ulang, buku, seragam & lihat rekap penerimaan kas</p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </button>

        {settingsOpen && (
          <div className="p-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="border border-slate-200 rounded-xl p-5 hover:border-violet-400 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700 m-0">Biaya Daftar Ulang</p>
                </div>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 ring-violet-200 transition-all">
                  <span className="px-3 py-2 bg-slate-50 text-slate-500 font-bold text-sm border-r border-slate-200">Rp</span>
                  <input type="number" value={settings.re_registration_fee} onChange={(e) => setSettings({...settings, re_registration_fee: Number(e.target.value)})} className="flex-1 px-3 py-2 border-none outline-none text-sm font-semibold" min="0" />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 hover:border-amber-400 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700 m-0">Biaya Buku / LKS</p>
                </div>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 ring-amber-200 transition-all">
                  <span className="px-3 py-2 bg-slate-50 text-slate-500 font-bold text-sm border-r border-slate-200">Rp</span>
                  <input type="number" value={settings.books_fee} onChange={(e) => setSettings({...settings, books_fee: Number(e.target.value)})} className="flex-1 px-3 py-2 border-none outline-none text-sm font-semibold" min="0" />
                </div>
              </div>

            </div>

            <div className="flex justify-end mb-8">
              <button onClick={saveSettings} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Simpan Pengaturan
              </button>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <p className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Rekap Penerimaan Kas Daftar Ulang
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-violet-700 m-0">Daftar Ulang</p>
                  <p className="font-heading font-extrabold text-xl text-violet-900 mt-1.5 mb-0">{fmtRp(paymentStats.total_fee)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{paymentStats.count_fee || 0} siswa lunas</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-amber-700 m-0">Buku / LKS</p>
                  <p className="font-heading font-extrabold text-xl text-amber-900 mt-1.5 mb-0">{fmtRp(paymentStats.total_books)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{paymentStats.count_books || 0} siswa lunas</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center shadow-inner">
                  <p className="text-xs font-bold text-emerald-700 m-0">Total Penerimaan</p>
                  <p className="font-heading font-extrabold text-xl text-emerald-900 mt-1.5 mb-0">{fmtRp(paymentStats.grand_total)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Masuk ke Kas Umum</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Line */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Total Siswa</p>
          <p className="font-heading font-extrabold text-3xl text-slate-800 mt-2 m-0">{stats.total || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Terkonfirmasi</p>
          <p className="font-heading font-extrabold text-3xl text-emerald-500 mt-2 m-0">{stats.confirmed || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Menunggu</p>
          <p className="font-heading font-extrabold text-3xl text-amber-500 mt-2 m-0">{stats.pending || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider m-0">Tidak Daftar</p>
          <p className="font-heading font-extrabold text-3xl text-rose-500 mt-2 m-0">{stats.not_registered || 0}</p>
        </div>
      </div>

      {/* Table Daftar Ulang */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600"></div>
          <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Siswa</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-3 text-xs font-bold text-slate-500 text-center w-12">No</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Nama Siswa</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-center">Kelas</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-center">L/P</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-center">Status</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-left">Administrasi</th>
                <th className="p-3 text-xs font-bold text-slate-500 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-sm">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-slate-400 text-sm">Belum ada data. Silakan Generate Batch.</td></tr>
              ) : (
                data.slice((page - 1) * limit, page * limit).map((item, i) => {
                  const p = item.payment || {};
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-sm text-slate-400 font-semibold text-center align-top">{(page - 1) * limit + i + 1}</td>
                      <td className="p-3 text-sm font-bold text-slate-800 align-top">{item.student_name}</td>
                      <td className="p-3 align-top text-center"><span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">{item.classroom}</span></td>
                      <td className="p-3 align-top text-center">
                        {item.gender === 'L' 
                          ? <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">PA</span>
                          : <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">PI</span>
                        }
                      </td>
                      <td className="p-3 align-top text-center">
                        {item.status === 'confirmed' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full">✓ Terkonfirmasi</span>}
                        {item.status === 'pending' && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">⏳ Menunggu</span>}
                        {item.status === 'not_registered' && <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full">✗ Tidak Daftar</span>}
                      </td>
                      <td className="p-3 align-top min-w-[200px]">
                        <div className="flex flex-col gap-1.5">
                          {/* Payment Badges */}
                          <button 
                            onClick={() => openPayModal(item.id.toString(), 'is_fee_paid', settings.re_registration_fee)}
                            className={`w-full text-left px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors flex justify-between items-center ${p.is_fee_paid ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                            <span>Daftar {settings.re_registration_fee > 0 && <span className="opacity-60">({settings.re_registration_fee/1000}k)</span>}</span>
                            <span className="font-black">{p.is_fee_paid ? '✓' : '−'}</span>
                          </button>
                          
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => openPayModal(item.id.toString(), 'is_books_paid', settings.books_fee)}
                              className={`flex-1 text-left px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors flex justify-between items-center ${p.is_books_paid ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            >
                              <span>Buku {settings.books_fee > 0 && <span className="opacity-60">({settings.books_fee/1000}k)</span>}</span>
                              <span className="font-black">{p.is_books_paid ? '✓' : '−'}</span>
                            </button>
                            <button 
                              onClick={() => togglePayment(item.id.toString(), 'is_books_received', 0, undefined)}
                              className={`flex-1 text-left px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors flex justify-between items-center ${p.is_books_received ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            >
                              <span>Ambil</span>
                              <span className="font-black">{p.is_books_received ? '✓' : '−'}</span>
                            </button>
                          </div>


                        </div>
                      </td>
                      <td className="p-3 align-top text-center relative">
                        <button 
                          onClick={(ev) => { 
                            ev.stopPropagation(); 
                            (ev.nativeEvent as any).stopImmediatePropagation();
                            setOpenActionId(openActionId === item.id.toString() ? null : item.id.toString()); 
                          }}
                          style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                          className="hover:bg-slate-100 transition-colors"
                        >
                          <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {openActionId === item.id.toString() && (
                          <div 
                            style={{ position: "absolute", top: "100%", right: "1rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "160px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem", textAlign: "left" }}>
                              Opsi Registrasi
                            </div>
                            
                            {item.status === 'pending' ? (
                              <>
                                <button onClick={() => { setOpenActionId(null); updateStatus(item.id, 'confirmed'); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                  Konfirmasi Reg
                                </button>
                                <button onClick={() => { setOpenActionId(null); updateStatus(item.id, 'not_registered'); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                  Tidak Daftar
                                </button>
                              </>
                            ) : (
                              <button onClick={() => { setOpenActionId(null); updateStatus(item.id, 'pending'); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Batalkan Status
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={Math.ceil(data.length / limit) || 1} total={data.length} limit={limit} onPageChange={(p) => setPage(p)} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      </div>
      {/* Modal Konfirmasi Bayar */}
      {showPayModal && payTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPayModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-heading font-bold text-lg text-slate-800 m-0">Konfirmasi Pembayaran Daftar Ulang</h3>
            <p className="text-sm text-slate-500 mt-1">
              Bayar <strong>{payTarget.field.replace('is_', '').replace('_paid', '')}</strong>
            </p>

            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nominal (Rp)</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full px-4 py-2.5 border-2 border-slate-200 bg-white text-slate-800 rounded-xl text-sm font-semibold outline-none focus:border-violet-400 transition-colors" min="0" />
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Akun Kas</label>
              <select value={payCashId} onChange={e => setPayCashId(e.target.value)} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-violet-400 transition-colors">
                <option value="">— Tanpa Akun Kas —</option>
                {cashAccounts.map((ca: any) => <option key={ca.id} value={ca.id}>{ca.name} (Rp {Number(ca.balance).toLocaleString("id-ID")})</option>)}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowPayModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-500 bg-slate-100 border-none rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">Batal</button>
              <button onClick={handlePayConfirm} disabled={payLoading} className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer transition-all ${payLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5'}`}>
                {payLoading ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
