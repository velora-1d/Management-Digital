"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { ExportButtons } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { UserCheck, CheckCircle2, XCircle, Clock, Pencil, DollarSign, BookOpen } from "lucide-react";

type ReRegistrationStatus = "pending" | "confirmed" | "not_registered";
type PaymentField = "is_fee_paid" | "is_books_paid" | "is_books_received";

interface ReRegistrationPayment {
  is_fee_paid?: boolean;
  is_books_paid?: boolean;
  is_books_received?: boolean;
}

interface ReRegistrationItem {
  id: number;
  student_name: string;
  classroom: string;
  gender: "L" | "P";
  status: ReRegistrationStatus;
  payment?: ReRegistrationPayment;
}

interface ReRegistrationStats {
  total?: number;
  confirmed?: number;
  pending?: number;
  not_registered?: number;
}

interface ReRegistrationPaymentStats {
  total_fee?: number;
  count_fee?: number;
  total_books?: number;
  count_books?: number;
  grand_total?: number;
}

interface CashAccountItem {
  id: number;
  name: string;
  balance: number;
}

export default function ReRegistrationPage() {
  const [data, setData] = useState<ReRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReRegistrationStats>({});
  const [paymentStats, setPaymentStats] = useState<ReRegistrationPaymentStats>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
  const [cashAccounts, setCashAccounts] = useState<CashAccountItem[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTarget, setPayTarget] = useState<{ regId: string; field: PaymentField; amount: number } | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payCashId, setPayCashId] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [verifyDrawerItem, setVerifyDrawerItem] = useState<ReRegistrationItem | null>(null);

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
    } catch {
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
        } catch {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const updateStatus = (id: number, status: ReRegistrationStatus) => {
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
            setData(prev => prev.map(item => {
              if (item.id === id) {
                const updated = { ...item, status };
                if (verifyDrawerItem && verifyDrawerItem.id === id) {
                  setVerifyDrawerItem(updated);
                }
                return updated;
              }
              return item;
            }));
            loadData();
          } else {
            Swal.fire("Gagal", json.error || "Error", "error");
          }
        } catch {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const handleBulkStatus = async (status: ReRegistrationStatus) => {
    if (selectedIds.length === 0) return;
    const label = status === "confirmed" ? "Konfirmasi" : status === "pending" ? "Set Menunggu" : "Tandai Tidak Daftar";
    const res = await Swal.fire({
      title: `${label} Siswa Terpilih?`,
      text: `Anda akan mengubah status ${selectedIds.length} siswa terpilih menjadi "${label}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: status === "confirmed" ? "#059669" : status === "pending" ? "#d97706" : "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, ${label} (${selectedIds.length})`,
      cancelButtonText: "Batal",
    });
    if (res.isConfirmed) {
      Swal.fire({ title: "Memproses...", didOpen: () => Swal.showLoading() });
      try {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`/api/reregistration/${id}/status`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status }),
            })
          )
        );
        Swal.fire({ icon: "success", title: "Berhasil", text: `${selectedIds.length} siswa berhasil diperbarui`, toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
        setSelectedIds([]);
        loadData();
        loadPaymentStats();
      } catch {
        Swal.fire("Error", "Gagal memperbarui status sebagian siswa", "error");
      }
    }
  };

  // Field yang melibatkan uang (butuh modal konfirmasi)
  const openPayModal = (regId: string, field: PaymentField, amount: number) => {
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

  const togglePayment = async (regId: string, field: PaymentField, amount: number, cashAccountId?: number) => {
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
            const updated = {
              ...item,
              payment: {
                ...item.payment,
                [field]: json.newState
              }
            };
            if (verifyDrawerItem && verifyDrawerItem.id.toString() === regId) {
              setVerifyDrawerItem(updated);
            }
            return updated;
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
    } catch {
      Swal.fire("Error", "Gagal menyimpan pembayaran", "error");
    }
  };

  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <PageHeader
        title="Pendaftaran Ulang Siswa"
        subtitle="Kelola konfirmasi daftar ulang siswa untuk tahun ajaran baru."
        icon={<UserCheck className="w-5 h-5 text-blue-600" />}
        actions={
          <button 
            onClick={generateData} 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs tracking-wider transition-all shadow-xs hover:shadow cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Generate Batch
          </button>
        }
      />

      {/* Settings Panel */}
      <Card className="p-0 overflow-hidden transition-all">
        <button 
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center justify-between p-5 bg-linear-to-br from-sky-50 to-slate-50 hover:from-sky-100 hover:to-slate-100 transition-colors border-b border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
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
          <div className="p-6 animate-fade-in-up border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="border border-slate-200 rounded-xl p-5 hover:border-cyan-400 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700 m-0">Biaya Daftar Ulang</p>
                </div>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 ring-cyan-200 transition-all">
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
              <button onClick={saveSettings} className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Simpan Pengaturan
              </button>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <p className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Rekap Penerimaan Kas Daftar Ulang
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-cyan-700 m-0">Daftar Ulang</p>
                  <p className="font-heading font-extrabold text-xl text-cyan-900 mt-1.5 mb-0">{fmtRp(paymentStats.total_fee || 0)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{paymentStats.count_fee || 0} siswa lunas</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-xs font-bold text-amber-700 m-0">Buku / LKS</p>
                  <p className="font-heading font-extrabold text-xl text-amber-900 mt-1.5 mb-0">{fmtRp(paymentStats.total_books || 0)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{paymentStats.count_books || 0} siswa lunas</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center shadow-inner">
                  <p className="text-xs font-bold text-emerald-700 m-0">Total Penerimaan</p>
                  <p className="font-heading font-extrabold text-xl text-emerald-900 mt-1.5 mb-0">{fmtRp(paymentStats.grand_total || 0)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Masuk ke Kas Umum</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Line */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Total Siswa</p>
          <p className="font-heading font-extrabold text-3xl text-slate-800 mt-2 m-0">{stats.total || 0}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Terkonfirmasi</p>
          <p className="font-heading font-extrabold text-3xl text-emerald-600 mt-2 m-0">{stats.confirmed || 0}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Menunggu</p>
          <p className="font-heading font-extrabold text-3xl text-amber-600 mt-2 m-0">{stats.pending || 0}</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Tidak Daftar</p>
          <p className="font-heading font-extrabold text-3xl text-rose-600 mt-2 m-0">{stats.not_registered || 0}</p>
        </Card>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in mb-4">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{selectedIds.length} siswa dipilih</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkStatus("confirmed")}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Konfirmasi ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus("pending")}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Set Menunggu</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus("not_registered")}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Tidak Daftar</span>
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

      {/* Table Daftar Ulang */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-linear-to-br from-cyan-500 to-blue-600"></div>
            <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Siswa</h4>
          </div>
          {data.length > 0 && (
            <ExportButtons options={{
              title: "Daftar Ulang Siswa",
              filename: `daftar_ulang_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "Nama Siswa", key: "student_name", width: 30 },
                { header: "Kelas", key: "classroom", width: 15, align: "center" },
                { header: "L/P", key: "gender", width: 8, align: "center" },
                { header: "Status", key: "_status", width: 15, align: "center" },
              ],
              data: data.map((item, i: number) => ({
                ...item,
                _no: i + 1,
                _status: item.status === 'confirmed' ? 'Terkonfirmasi' : item.status === 'pending' ? 'Menunggu' : item.status === 'not_registered' ? 'Tidak Daftar' : item.status,
              })),
            }} />
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? data.map((d) => d.id) : [])}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label="Pilih semua data"
                  />
                </th>
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
                <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-sm">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-sm">Belum ada data. Silakan Generate Batch.</td></tr>
              ) : (
                data.slice((page - 1) * limit, page * limit).map((item, i) => {
                  const p = item.payment || {};
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="p-3 text-center align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih ${item.student_name}`}
                        />
                      </td>
                      <td className="p-3 text-sm text-slate-400 font-semibold text-center align-top">{(page - 1) * limit + i + 1}</td>
                      <td className="p-3 text-sm font-bold text-slate-800 align-top">{item.student_name}</td>
                      <td className="p-3 align-top text-center"><span className="px-3 py-1 bg-sky-100 text-cyan-700 text-xs font-bold rounded-full">{item.classroom}</span></td>
                      <td className="p-3 align-top text-center">
                        {item.gender === 'L' 
                          ? <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">PA</span>
                          : <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">PI</span>
                        }
                      </td>
                      <td className="p-3 align-top text-center">
                        {item.status === 'confirmed' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full">Terkonfirmasi</span>}
                        {item.status === 'pending' && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">Menunggu</span>}
                        {item.status === 'not_registered' && <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full">Tidak Daftar</span>}
                      </td>
                      <td className="p-3 align-top min-w-[200px]">
                        <div className="flex flex-col gap-1.5">
                          {/* Payment Badges */}
                          <button 
                            onClick={() => openPayModal(item.id.toString(), 'is_fee_paid', settings.re_registration_fee)}
                            className={`w-full text-left px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors flex justify-between items-center ${p.is_fee_paid ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                            <span>Daftar {settings.re_registration_fee > 0 && <span className="opacity-60">({settings.re_registration_fee/1000}k)</span>}</span>
                            <span className="font-semibold text-[11px]">{p.is_fee_paid ? 'Lunas' : 'Belum'}</span>
                          </button>
                          
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => openPayModal(item.id.toString(), 'is_books_paid', settings.books_fee)}
                              className={`flex-1 text-left px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors flex justify-between items-center ${p.is_books_paid ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            >
                              <span>Buku {settings.books_fee > 0 && <span className="opacity-60">({settings.books_fee/1000}k)</span>}</span>
                              <span className="font-semibold text-[11px]">{p.is_books_paid ? 'Lunas' : 'Belum'}</span>
                            </button>
                            <button 
                              onClick={() => togglePayment(item.id.toString(), 'is_books_received', 0, undefined)}
                              className={`flex-1 text-left px-2 py-1.5 rounded-md border text-xs font-semibold transition-colors flex justify-between items-center ${p.is_books_received ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                            >
                              <span>Ambil</span>
                              <span className="font-semibold text-[11px]">{p.is_books_received ? 'Sudah' : 'Belum'}</span>
                            </button>
                          </div>


                        </div>
                      </td>
                      <td className="p-3 align-top text-center relative">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setVerifyDrawerItem(item)}
                            title="Verifikasi & Kelola Siswa"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(ev) => { 
                              ev.stopPropagation(); 
                              ev.nativeEvent.stopImmediatePropagation();
                              setOpenActionId(openActionId === item.id.toString() ? null : item.id.toString()); 
                            }}
                            style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                            className="hover:bg-slate-100 transition-colors"
                          >
                            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>

                        {openActionId === item.id.toString() && (
                          <div 
                            style={{ position: "absolute", top: "100%", right: "1rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "160px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem", textAlign: "left" }}>
                              Opsi Registrasi
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionId(null);
                                setVerifyDrawerItem(item);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-blue-600" />
                              Verifikasi (Drawer)
                            </button>
                            
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
      </Card>

      {/* LeftDrawer Verifikasi Siswa */}
      <LeftDrawer
        isOpen={!!verifyDrawerItem}
        onClose={() => setVerifyDrawerItem(null)}
        title="Verifikasi Daftar Ulang"
        subtitle={verifyDrawerItem ? `${verifyDrawerItem.student_name} (${verifyDrawerItem.classroom})` : undefined}
        width="max-w-xl"
      >
        {verifyDrawerItem && (
          <div className="space-y-5">
            {/* Profil Siswa */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Profil Siswa</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                  verifyDrawerItem.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  verifyDrawerItem.status === 'not_registered' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {verifyDrawerItem.status === 'confirmed' ? 'Terkonfirmasi' : verifyDrawerItem.status === 'not_registered' ? 'Tidak Daftar' : 'Menunggu'}
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">{verifyDrawerItem.student_name}</p>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span>Kelas: <strong className="text-slate-800">{verifyDrawerItem.classroom}</strong></span>
                <span>•</span>
                <span>Jenis Kelamin: <strong className="text-slate-800">{verifyDrawerItem.gender === 'L' ? 'Putra' : 'Putri'}</strong></span>
              </div>
            </div>

            {/* Aksi Status Verifikasi */}
            <div className="space-y-2 pb-3 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Ubah Status Pendaftaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(verifyDrawerItem.id, 'confirmed')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                    verifyDrawerItem.status === 'confirmed'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(verifyDrawerItem.id, 'pending')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                    verifyDrawerItem.status === 'pending'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Menunggu</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(verifyDrawerItem.id, 'not_registered')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                    verifyDrawerItem.status === 'not_registered'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tidak Daftar</span>
                </button>
              </div>
            </div>

            {/* Administrasi & Pembayaran */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Administrasi & Pembayaran
              </label>

              {/* 1. Biaya Daftar Ulang */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">Biaya Daftar Ulang</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      verifyDrawerItem.payment?.is_fee_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {verifyDrawerItem.payment?.is_fee_paid ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {fmtRp(settings.re_registration_fee)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openPayModal(verifyDrawerItem.id.toString(), 'is_fee_paid', settings.re_registration_fee)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    verifyDrawerItem.payment?.is_fee_paid
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {verifyDrawerItem.payment?.is_fee_paid ? 'Batalkan Bayar' : 'Bayar Sekarang'}
                </button>
              </div>

              {/* 2. Biaya Buku */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">Biaya Buku / LKS</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      verifyDrawerItem.payment?.is_books_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {verifyDrawerItem.payment?.is_books_paid ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {fmtRp(settings.books_fee)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openPayModal(verifyDrawerItem.id.toString(), 'is_books_paid', settings.books_fee)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    verifyDrawerItem.payment?.is_books_paid
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {verifyDrawerItem.payment?.is_books_paid ? 'Batalkan Bayar' : 'Bayar Sekarang'}
                </button>
              </div>

              {/* 3. Pengambilan Buku */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">Status Pengambilan Buku</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      verifyDrawerItem.payment?.is_books_received ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {verifyDrawerItem.payment?.is_books_received ? 'Sudah Diambil' : 'Belum Diambil'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Penyerahan fisik buku paket siswa</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePayment(verifyDrawerItem.id.toString(), 'is_books_received', 0, undefined)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    verifyDrawerItem.payment?.is_books_received
                      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {verifyDrawerItem.payment?.is_books_received ? 'Batal Ambil' : 'Tandai Diambil'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setVerifyDrawerItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}
      </LeftDrawer>

      {/* LeftDrawer Konfirmasi Bayar */}
      <LeftDrawer
        isOpen={showPayModal && !!payTarget}
        onClose={() => {
          setShowPayModal(false);
          setPayTarget(null);
        }}
        title="Konfirmasi Pembayaran Daftar Ulang"
        subtitle={payTarget ? `Bayar ${payTarget.field === 'is_fee_paid' ? 'Biaya Daftar Ulang' : 'Biaya Buku'} — ID #${payTarget.regId}` : undefined}
        width="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-blue-900">
              {payTarget?.field === 'is_fee_paid' ? 'Biaya Daftar Ulang' : 'Biaya Buku & LKS'}
            </p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Catatan transaksi akan dibukukan ke akun kas yang dipilih.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nominal (Rp)
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 transition-colors"
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Akun Kas
            </label>
            <select
              value={payCashId}
              onChange={(e) => setPayCashId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-slate-800 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">— Tanpa Akun Kas —</option>
              {cashAccounts.map((ca) => (
                <option key={ca.id} value={ca.id}>
                  {ca.name} (Rp {Number(ca.balance).toLocaleString("id-ID")})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowPayModal(false);
                setPayTarget(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePayConfirm}
              disabled={payLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {payLoading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </LeftDrawer>
    </div>
  );
}
