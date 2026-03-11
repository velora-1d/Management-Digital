"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExportButtons } from "@/lib/export-utils";
import Pagination from "@/components/Pagination";

export default function PpdbPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Row Action Dropdown state
  const [openActionId, setOpenActionId] = useState<number | null>(null);

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

  // Settings biaya PPDB
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ppdbSettings, setPpdbSettings] = useState({ daftar: 0, buku: 0, seragam: 0 });
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payCashId, setPayCashId] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/ppdb/settings");
      const json = await res.json();
      if (json.success) {
        setPpdbSettings({
          daftar: json.data?.daftar || 0,
          buku: json.data?.buku || 0,
          seragam: json.data?.seragam || 0,
        });
      }
    } catch (e) { console.error(e); }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch("/api/ppdb/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ppdbSettings),
      });
      const json = await res.json();
      if (json.success) showToast("Biaya PPDB berhasil disimpan.");
      else showToast(json.message || "Gagal menyimpan", "error");
    } catch (e) { showToast("Gagal menghubungi server", "error"); }
  };

  // Modal konversi
  const [showConvert, setShowConvert] = useState(false);
  const [convertReg, setConvertReg] = useState<any>(null);
  const [convertClassroom, setConvertClassroom] = useState("");
  const [convertInfaq, setConvertInfaq] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async (q = search, p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ppdb?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setStats(json.stats);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotal(json.pagination.total);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, page, limit]);

  async function loadClassrooms() {
    try {
      const res = await fetch("/api/classrooms");
      const json = await res.json();
      if (json.success) setClassrooms(json.data);
    } catch (e) { console.error(e); }
  }

  async function loadCashAccounts() {
    try {
      const res = await fetch("/api/cash-accounts");
      const json = await res.json();
      if (json.success) setCashAccounts(json.data || []);
    } catch (e) { console.error(e); }
  }

  async function loadPaymentStats() {
    try {
      const res = await fetch("/api/ppdb/stats");
      const json = await res.json();
      if (json.success) setPaymentStats(json.data);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadData(); loadClassrooms(); loadCashAccounts(); loadPaymentStats(); }, []);
  useEffect(() => { loadData(search, page); }, [page]);

  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearch(q);
    setPage(1);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadData(q, 1), 400);
  }

  // === Terima  ===
  async function handleApprove(reg: any) {
    const result = await Swal.fire({
      title: "Terima Pendaftar?",
      text: `Terima ${reg.name}? Payment items akan dibuat otomatis.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Terima"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/ppdb/${reg.id}/approve`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal menerima pendaftar", "error"); }
  }

  // === Tolak ===
  async function handleReject(reg: any) {
    const result = await Swal.fire({
      title: "Tolak Pendaftar?",
      text: `Tolak ${reg.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Tolak"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/ppdb/${reg.id}/reject`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal menolak pendaftar", "error"); }
  }

  // === Konversi ===
  function openConvert(reg: any) {
    setConvertReg(reg);
    setConvertClassroom("");
    setConvertInfaq("");
    setShowConvert(true);
  }

  async function handleConvert() {
    if (!convertReg) return;
    setConvertLoading(true);
    try {
      const res = await fetch(`/api/ppdb/${convertReg.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId: convertClassroom ? Number(convertClassroom) : undefined,
          infaqNominal: convertInfaq ? Number(convertInfaq) : 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowConvert(false);
        setConvertReg(null);
        loadData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal konversi ke siswa", "error"); }
    finally { setConvertLoading(false); }
  }

  // === Toggle Payment (dengan modal) ===
  async function openPayModal(payment: any) {
    if (payment.isPaid) {
      // Revert langsung dengan konfirmasi
      const result = await Swal.fire({
        title: "Batalkan Pembayaran?",
        text: `Batalkan pembayaran ${payment.paymentType}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d97706",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Ya, Batalkan"
      });
      if (!result.isConfirmed) return;
      doTogglePayment(payment.id, 0, 0);
      return;
    }
    let nominalFromSettings = Number(payment.nominal || 0);
    if (payment.paymentType === 'daftar' && ppdbSettings.daftar > 0) nominalFromSettings = ppdbSettings.daftar;
    else if (payment.paymentType === 'buku' && ppdbSettings.buku > 0) nominalFromSettings = ppdbSettings.buku;
    else if (payment.paymentType === 'seragam' && ppdbSettings.seragam > 0) nominalFromSettings = ppdbSettings.seragam;

    setPayTarget(payment);
    setPayAmount(String(nominalFromSettings));
    setPayCashId("");
    setShowPayModal(true);
  }

  async function doTogglePayment(paymentId: number, amount: number, cashAccountId: number) {
    try {
      const res = await fetch(`/api/quick-payment/${paymentId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, cashAccountId: cashAccountId || undefined }),
      });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal proses pembayaran", "error"); }
  }

  async function handlePayConfirm() {
    if (!payTarget) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) { showToast("Nominal harus lebih dari 0", "error"); return; }
    setPayLoading(true);
    await doTogglePayment(payTarget.id, amt, Number(payCashId) || 0);
    setShowPayModal(false);
    setPayTarget(null);
    setPayLoading(false);
  }

  // === Reset / Batalkan ===
  async function handleReset(reg: any) {
    const result = await Swal.fire({
      title: "Batalkan Status?",
      text: `Batalkan status "${reg.status}" untuk ${reg.name}? Status akan kembali ke Menunggu.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/ppdb/${reg.id}/reset`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal reset status", "error"); }
  }

  const filtered = statusFilter ? data.filter(d => d.status === statusFilter) : data;

  const thS: React.CSSProperties = { padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: toast.type === "success" ? "#059669" : "#e11d48", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#0284c7 50%,#0369a1 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Penerimaan Siswa Baru (PPDB)</h2>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: "0.125rem 0 0" }}>Kelola pendaftaran, penerimaan, dan konversi ke siswa.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ppdb/new" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "none" }} className="hover:bg-white/35 transition-all">
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah Pendaftar
              </Link>
              <button onClick={async () => {
                const result = await Swal.fire({
                  title: "Perbaiki Data?",
                  text: "Perbaiki data pembayaran untuk pendaftar yang sudah diterima tapi belum punya record pembayaran?",
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonColor: "#0284c7",
                  cancelButtonColor: "#64748b",
                  confirmButtonText: "Ya, Perbaiki"
                });
                if (!result.isConfirmed) return;
                try {
                  const res = await fetch("/api/ppdb/fix-payments", { method: "POST" });
                  const json = await res.json();
                  if (json.success) { showToast(json.message); loadData(); }
                  else showToast(json.message, "error");
                } catch { showToast("Gagal memperbaiki data", "error"); }
              }} style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }} className="hover:bg-white/25 transition-all">
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Perbaiki Data
              </button>
            </div>
          </div>

          {/* KPI Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ marginTop: "1.5rem" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "0.75rem" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{stats.total}</p>
              </div>
              <div style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.3)", padding: "1rem", borderRadius: "0.75rem" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 600, color: "#fef3c7", textTransform: "uppercase", letterSpacing: "0.05em" }}>Menunggu</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{stats.pending}</p>
              </div>
              <div style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)", padding: "1rem", borderRadius: "0.75rem" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 600, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Diterima</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{stats.diterima}</p>
              </div>
              <div style={{ background: "rgba(225,29,72,0.2)", border: "1px solid rgba(225,29,72,0.3)", padding: "1rem", borderRadius: "0.75rem" }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 600, color: "#fecdd3", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ditolak</p>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{stats.ditolak}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel Biaya PPDB */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <button
          onClick={() => { setSettingsOpen(!settingsOpen); if (!settingsOpen) loadSettings(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, background: "#e0f2fe", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 18, height: 18, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>Pengaturan Biaya PPDB</p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.125rem 0 0" }}>Atur biaya formulir pendaftaran, buku, dan seragam</p>
            </div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.3s", transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
            <svg style={{ width: 16, height: 16, color: "#64748b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        {settingsOpen && (
          <div style={{ padding: "0 1.5rem 1.5rem", borderTop: "1px solid #f1f5f9" }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: "1rem" }}>
              <div style={{ background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 40, height: 40, background: "#e0f2fe", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg style={{ width: 18, height: 18, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", margin: 0 }}>Biaya Daftar</p>
                  <input type="number" value={ppdbSettings.daftar} onChange={(e) => setPpdbSettings({...ppdbSettings, daftar: Number(e.target.value)})} style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginTop: "0.25rem" }} min="0" />
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 40, height: 40, background: "#fef3c7", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg style={{ width: 18, height: 18, color: "#d97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", margin: 0 }}>Biaya Buku / LKS</p>
                  <input type="number" value={ppdbSettings.buku} onChange={(e) => setPpdbSettings({...ppdbSettings, buku: Number(e.target.value)})} style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginTop: "0.25rem" }} min="0" />
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 40, height: 40, background: "#ffe4e6", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg style={{ width: 18, height: 18, color: "#e11d48" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", margin: 0 }}>Biaya Seragam</p>
                  <input type="number" value={ppdbSettings.seragam} onChange={(e) => setPpdbSettings({...ppdbSettings, seragam: Number(e.target.value)})} style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", marginTop: "0.25rem" }} min="0" />
                </div>
              </div>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveSettings} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.5rem", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", border: "none", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer" }} className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Simpan Biaya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rekap Penerimaan Kas PPDB */}
      {paymentStats && (
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#059669,#047857)", borderRadius: "50%" }} />
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Rekap Penerimaan Kas PPDB</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div style={{ background: "#e0f2fe", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", margin: 0 }}>Daftar</p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800, color: "#0c4a6e", margin: "0.25rem 0 0" }}>Rp {Number(paymentStats.daftar?.total || 0).toLocaleString("id-ID")}</p>
              <p style={{ fontSize: "0.625rem", color: "#64748b", margin: "0.125rem 0 0" }}>{paymentStats.daftar?.count || 0} lunas</p>
            </div>
            <div style={{ background: "#fef3c7", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#d97706", textTransform: "uppercase", margin: 0 }}>Buku</p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800, color: "#78350f", margin: "0.25rem 0 0" }}>Rp {Number(paymentStats.buku?.total || 0).toLocaleString("id-ID")}</p>
              <p style={{ fontSize: "0.625rem", color: "#64748b", margin: "0.125rem 0 0" }}>{paymentStats.buku?.count || 0} lunas</p>
            </div>
            <div style={{ background: "#ffe4e6", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#e11d48", textTransform: "uppercase", margin: 0 }}>Seragam</p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800, color: "#881337", margin: "0.25rem 0 0" }}>Rp {Number(paymentStats.seragam?.total || 0).toLocaleString("id-ID")}</p>
              <p style={{ fontSize: "0.625rem", color: "#64748b", margin: "0.125rem 0 0" }}>{paymentStats.seragam?.count || 0} lunas</p>
            </div>
            <div style={{ background: "#d1fae5", borderRadius: "0.75rem", padding: "1rem", textAlign: "center", border: "1.5px solid #a7f3d0" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "#047857", textTransform: "uppercase", margin: 0 }}>Total</p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800, color: "#064e3b", margin: "0.25rem 0 0" }}>Rp {Number(paymentStats.grandTotal || 0).toLocaleString("id-ID")}</p>
              <p style={{ fontSize: "0.625rem", color: "#64748b", margin: "0.125rem 0 0" }}>Masuk Kas</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem 1.5rem" }}>
        <div className="flex flex-wrap items-end gap-4">
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Cari Nama</label>
            <input type="text" value={search} onChange={handleSearch} placeholder="Ketik nama..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
              <option value="">Semua</option>
              <option value="menunggu">Menunggu</option>
              <option value="pending">Pending</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Pendaftar */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius: "50%" }} />
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Pendaftar</h4>
          </div>
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#0284c7", background: "#e0f2fe", padding: "0.25rem 0.75rem", borderRadius: 999 }}>{filtered.length} Data</span>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <ExportButtons options={{
              title: "Data PPDB - Penerimaan Siswa Baru",
              filename: `ppdb_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "No. Reg", key: "_formNo", width: 15 },
                { header: "Nama Calon Siswa", key: "name", width: 30 },
                { header: "L/P", key: "gender", width: 8, align: "center" },
                { header: "Nama Ayah", key: "fatherName", width: 20 },
                { header: "Nama Ibu", key: "motherName", width: 20 },
                { header: "Status", key: "_status", width: 12, align: "center" },
              ],
              data: filtered.map((r: any, i: number) => ({
                ...r,
                _no: i + 1,
                _formNo: r.formNo || `#${r.id}`,
                name: r.name || '-',
                fatherName: r.fatherName || '-',
                motherName: r.motherName || '-',
                _status: r.status === 'menunggu' || r.status === 'pending' ? 'Menunggu' : r.status === 'diterima' ? 'Diterima' : r.status === 'ditolak' ? 'Ditolak' : r.status === 'converted' ? 'Converted' : r.status,
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ ...thS, textAlign: "center", width: 50 }}>No</th>
                <th style={thS}>No. Reg</th>
                <th style={thS}>Nama Calon Siswa</th>
                <th style={{ ...thS, textAlign: "center" }}>L/P</th>
                <th style={{ ...thS, textAlign: "center" }}>Pembayaran</th>
                <th style={{ ...thS, textAlign: "center" }}>Status</th>
                <th style={{ ...thS, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat data pendaftar...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Pendaftar</p>
                  </div>
                </td></tr>
              ) : filtered.map((reg: any, i: number) => {
                const genderBadge = reg.gender === "L"
                  ? <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.25rem 0.625rem", borderRadius: 999, color: "#6366f1", background: "#eef2ff" }}>Putra</span>
                  : <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.25rem 0.625rem", borderRadius: 999, color: "#ec4899", background: "#fdf2f8" }}>Putri</span>;

                let statusBadge;
                const s = reg.status;
                if (s === "menunggu" || s === "pending") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", borderRadius: 999 }}>⏳ Menunggu</span>;
                else if (s === "diterima") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}>✓ Diterima</span>;
                else if (s === "ditolak") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#be123c", background: "#ffe4e6", borderRadius: 999 }}>✗ Ditolak</span>;
                else if (s === "converted") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", borderRadius: 999 }}>⇌ Siswa</span>;
                else statusBadge = <span style={{ padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 999 }}>{s}</span>;

                return (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: s === "ditolak" ? 0.5 : 1 }}>
                    <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#0ea5e9" }}>{reg.formNo || `#${reg.id}`}</td>
                    <td style={{ padding: "1rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{reg.name || "-"}</p>
                      <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{reg.fatherName || reg.motherName || "-"}</p>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>{genderBadge}</td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center", flexWrap: "wrap" }}>
                        {(reg.payments && reg.payments.length > 0) ? Array.from(new Map(reg.payments.map((p: any) => [p.paymentType, p])).values()).map((p: any) => (
                          <button key={p.id} onClick={() => openPayModal(p)}
                            title={`${p.paymentType}: Rp ${Number(p.nominal).toLocaleString('id-ID')} — klik untuk ${p.isPaid ? 'revert' : 'bayar'}`}
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.625rem", fontWeight: 700, borderRadius: 999, border: "none", cursor: "pointer",
                              background: p.isPaid ? "#d1fae5" : "#fef3c7", color: p.isPaid ? "#047857" : "#92400e" }}>
                            {p.isPaid ? "✓" : "○"} {p.paymentType}
                          </button>
                        )) : <span style={{ fontSize: "0.625rem", color: "#cbd5e1" }}>—</span>}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>{statusBadge}</td>
                    <td style={{ padding: "1rem", textAlign: "center", position: "relative" }}>
                      <button 
                        onClick={(ev) => { 
                          ev.stopPropagation(); 
                          (ev.nativeEvent as any).stopImmediatePropagation();
                          setOpenActionId(openActionId === reg.id ? null : reg.id); 
                        }}
                        style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                        className="hover:bg-slate-100 transition-colors"
                      >
                        <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {openActionId === reg.id && (
                        <div 
                          style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "160px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem", textAlign: "left" }}>
                            Aksi PPDB
                          </div>
                          
                          <button onClick={() => { setOpenActionId(null); router.push(`/ppdb/${reg.id}`); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                            Detail & Berkas
                          </button>

                          {(s === "menunggu" || s === "pending") && (
                            <>
                              <button onClick={() => { setOpenActionId(null); handleApprove(reg); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Terima Calon
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleReject(reg); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Tolak Calon
                              </button>
                            </>
                          )}

                          {s === "diterima" && (
                            <>
                              <button onClick={() => { setOpenActionId(null); openConvert(reg); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Konversi ke Siswa
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleReset(reg); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                                Batal Terima
                              </button>
                            </>
                          )}

                          {s === "ditolak" && (
                            <button onClick={() => { setOpenActionId(null); handleReset(reg); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                              Batalkan Tolak
                            </button>
                          )}

                          <button onClick={async () => {
                            setOpenActionId(null);
                            const result = await Swal.fire({
                              title: "Hapus Pendaftar?",
                              text: `Hapus pendaftar ${reg.name}?`,
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#e11d48",
                              cancelButtonColor: "#64748b",
                              confirmButtonText: "Ya, Hapus"
                            });
                            if (!result.isConfirmed) return;
                            try {
                              const res = await fetch(`/api/ppdb/${reg.id}`, { method: "DELETE" });
                              const json = await res.json();
                              if (json.success) { showToast(json.message); loadData(); }
                              else showToast(json.message, "error");
                            } catch { showToast("Gagal hapus", "error"); }
                          }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors text-left border-none bg-transparent cursor-pointer">
                            Hapus Data
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      </div>

      {/* Modal Konversi ke Siswa */}
      {showConvert && convertReg && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowConvert(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 440, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Konversi ke Siswa</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>
              <strong>{convertReg.name}</strong> akan dijadikan siswa aktif.
            </p>

            <div style={{ marginTop: "1.25rem", padding: "1rem", background: "#f0f9ff", borderRadius: "0.75rem", border: "1px solid #bae6fd" }}>
              <p style={{ fontSize: "0.75rem", color: "#0284c7", margin: 0 }}>
                📋 Data NISN, NIK, nama ortu, dan alamat akan otomatis disalin dari formulir PPDB.
              </p>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Kelas Tujuan</label>
              <select value={convertClassroom} onChange={e => setConvertClassroom(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">— Belum Ditentukan —</option>
                {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Nominal Infaq/SPP Bulanan (Rp)</label>
              <input type="number" value={convertInfaq} onChange={e => setConvertInfaq(e.target.value)} placeholder="0" style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowConvert(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handleConvert} disabled={convertLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: convertLoading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.625rem", cursor: convertLoading ? "not-allowed" : "pointer" }}>
                {convertLoading ? "Memproses..." : "Konversi Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Bayar */}
      {showPayModal && payTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPayModal(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 400, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Konfirmasi Pembayaran</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>
              Bayar <strong>{payTarget.paymentType}</strong> untuk PPDB #{payTarget.payableId}
            </p>

            <div style={{ marginTop: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Nominal (Rp)</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", fontWeight: 600, outline: "none", backgroundColor: "#fff", color: "#1e293b" }} min="0" />
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Akun Kas</label>
              <select value={payCashId} onChange={e => setPayCashId(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">— Tanpa Akun Kas —</option>
                {cashAccounts.map((ca: any) => <option key={ca.id} value={ca.id}>{ca.name} (Rp {Number(ca.balance).toLocaleString("id-ID")})</option>)}
              </select>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowPayModal(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handlePayConfirm} disabled={payLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: payLoading ? "#94a3b8" : "linear-gradient(135deg,#059669,#047857)", border: "none", borderRadius: "0.625rem", cursor: payLoading ? "not-allowed" : "pointer" }}>
                {payLoading ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
