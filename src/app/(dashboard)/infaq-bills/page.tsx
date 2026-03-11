"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Swal from "sweetalert2";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import FilterBar from "@/components/FilterBar";
import { ExportButtons, fmtRupiah, type ExportOptions } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Wallet, Settings, RefreshCcw, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const monthNames: Record<number, string> = {1:'Januari',2:'Februari',3:'Maret',4:'April',5:'Mei',6:'Juni',7:'Juli',8:'Agustus',9:'September',10:'Oktober',11:'November',12:'Desember'};
const monthShort: Record<number, string> = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Agu',9:'Sep',10:'Okt',11:'Nov',12:'Des'};

function InfaqBillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const queryString = searchParams.toString();

  // Modal states
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showReset, setShowReset] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  
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

  // Bulk update classroom infaq form
  const [bulkClassIds, setBulkClassIds] = useState<number[]>([]);
  const [bulkNominal, setBulkNominal] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Generate form
  const [genMonths, setGenMonths] = useState<number[]>([]);
  const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
  const [genAcademicYearId, setGenAcademicYearId] = useState("");
  const [genClassroomId, setGenClassroomId] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genPeriod, setGenPeriod] = useState<"bulanan" | "semester" | "tahunan">("bulanan");
  const [genSemester, setGenSemester] = useState("1");

  // Reset form
  const [resetMode, setResetMode] = useState<"semester" | "bulan">("semester");
  const [resetYear, setResetYear] = useState(new Date().getFullYear().toString());
  const [resetSemester, setResetSemester] = useState("1");
  const [resetMonths, setResetMonths] = useState<number[]>([]);
  const [resetClassId, setResetClassId] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [bulkYearId, setBulkYearId] = useState("");

  // Payment form
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payNotes, setPayNotes] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("tunai");
  const [payCashId, setPayCashId] = useState("");
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["infaq-bills", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/infaq-bills?${queryString}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const data: any[] = queryResult?.data || [];
  const pagination = queryResult?.pagination || { page: 1, totalPages: 1, total: 0, limit: 20 };

  const refreshData = () => queryClient.invalidateQueries({ queryKey: ["infaq-bills"] });

  useEffect(() => {
    fetch("/api/cash-accounts").then(r => r.json()).then(j => { if (j.success) setCashAccounts(j.data || []); }).catch(() => {});
    fetch("/api/classrooms").then(r => r.json()).then(j => { if (j.success) setClassrooms(j.data || []); }).catch(() => {});
    fetch("/api/academic-years").then(r => r.json()).then(j => { if (j.success) setAcademicYears(j.data || []); }).catch(() => {});
  }, []);

  // === Generate Tagihan ===
  async function handleGenerate() {
    // Validasi bulan berdasarkan mode periode
    if (genPeriod === "bulanan" && genMonths.length === 0) {
      showToast("Pilih minimal 1 bulan", "error"); return;
    }
    // Untuk periode tahunan: tidak perlu pilih bulan/semester, langsung generate 12 bulan
    
    // Validasi: Cek apakah ada kelas yang tarifnya 0 (hanya cek kelas target jika dipilih)
    const targetClasses = genClassroomId
      ? classrooms.filter(c => c.id === Number(genClassroomId))
      : classrooms;
    const zeroInfaqClasses = targetClasses.filter(c => !c.infaqNominal || c.infaqNominal <= 0);
    if (zeroInfaqClasses.length > 0) {
      const classNames = zeroInfaqClasses.map(c => c.name).join(", ");
      const result = await Swal.fire({
        title: "Nominal SPP / Infaq Belum Diatur!",
        html: `
          <div style="text-align: left; font-size: 0.875rem;">
            <p>Terdapat <strong>${zeroInfaqClasses.length} kelas</strong> yang belum memiliki nominal:</p>
            <div style="background: #f1f5f9; padding: 0.75rem; border-radius: 0.5rem; margin: 0.5rem 0; color: #475569; font-family: monospace; max-height: 80px; overflow-y: auto;">
              ${classNames}
            </div>
            <p style="color: #ef4444; font-weight: 700; margin-top: 0.5rem;">Silakan atur nominal terlebih dahulu sebelum generate tagihan.</p>
          </div>
        `,
        icon: "error",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Atur Biaya Sekarang",
        cancelButtonText: "Batal"
      });
      if (result.isConfirmed) {
        setShowGenerate(false);
        setShowBulkUpdate(true);
      }
      return;
    }

    setGenLoading(true);
    try {
      // Siapkan body request berdasarkan mode periode
      const reqBody: any = {
        year: genYear,
        period: genPeriod,
        academicYearId: genAcademicYearId ? Number(genAcademicYearId) : undefined,
        classroomId: genClassroomId ? Number(genClassroomId) : undefined,
      };
      if (genPeriod === "tahunan") {
        reqBody.period = "tahunan";
      } else if (genPeriod === "semester") {
        reqBody.semester = Number(genSemester);
      } else {
        reqBody.months = genMonths.map(m => monthNames[m]);
      }

      const res = await fetch("/api/infaq-bills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowGenerate(false);
        setGenMonths([]);
        refreshData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal generate tagihan", "error"); }
    finally { setGenLoading(false); }
  }

  // === Bayar Tagihan ===
  async function handlePayment() {
    if (!selectedBill || !payAmount) return;
    if (payMethod !== "tabungan" && !payCashId) { showToast("Pilih akun kas terlebih dahulu", "error"); return; }
    setPayLoading(true);
    try {
      const res = await fetch("/api/infaq-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBill.id,
          amountPaid: Number(payAmount),
          paymentDate: payDate,
          notes: payNotes,
          paymentMethod: payMethod,
          cashAccountId: payCashId ? Number(payCashId) : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowPayment(false);
        setSelectedBill(null);
        setPayAmount("");
        setPayNotes("");
        setPayMethod("tunai");
        setPayCashId("");
        refreshData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal memproses pembayaran", "error"); }
    finally { setPayLoading(false); }
  }

  // === Edit Nominal Tagihan ===
  async function handleEditNominal(bill: any) {
    const { value: newValStr } = await Swal.fire({
      title: "Edit Nominal",
      input: "number",
      inputLabel: `Edit nominal tagihan untuk ${bill.student_name}`,
      inputValue: bill.nominal,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal"
    });
    if (newValStr === undefined || newValStr === null || newValStr === "") return;
    const newNominal = parseInt(newValStr, 10);
    if (isNaN(newNominal) || newNominal < 0) {
      Swal.fire("Error", "Nominal tidak valid", "error");
      return;
    }
    try {
      const res = await fetch(`/api/infaq-bills/${bill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominal: Number(newNominal) }),
      });
      const json = await res.json();
      if (json.success) { showToast(json.message); refreshData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal edit tagihan", "error"); }
  }

  // === Hapus Tagihan ===
  async function handleDelete(billId: number) {
    const result = await Swal.fire({
      title: "Hapus Tagihan?",
      text: "Hapus tagihan ini? Tagihan yang sudah ada pembayaran tidak bisa dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { showToast(json.message); refreshData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal hapus tagihan", "error"); }
  }

  // === Void Tagihan ===
  async function handleVoid(billId: number) {
    const result = await Swal.fire({
      title: "Void Tagihan?",
      text: "Batalkan (Void) tagihan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Void"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}/void`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); refreshData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal void tagihan", "error"); }
  }

  // === Revert Tagihan ===
  async function handleRevert(billId: number) {
    const result = await Swal.fire({
      title: "Batalkan Pelunasan?",
      text: "Ubah status tagihan ini kembali menjadi belum lunas?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}/revert`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); refreshData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal revert tagihan", "error"); }
  }

  // === Bulk Update Infaq Kelas ===
  async function handleBulkUpdate() {
    if (bulkClassIds.length === 0) { showToast("Pilih minimal satu kelas", "error"); return; }
    if (bulkNominal === "") { showToast("Isi nominal biaya", "error"); return; }
    setBulkLoading(true);
    try {
      const res = await fetch("/api/classrooms/bulk-update-infaq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classIds: bulkClassIds, nominal: Number(bulkNominal) }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Berhasil Diperbarui!",
          text: `Biaya SPP untuk ${bulkClassIds.length} kelas telah diset menjadi Rp ${Number(bulkNominal).toLocaleString("id-ID")}.`,
          icon: "success",
          confirmButtonColor: "#059669",
        });
        setShowBulkUpdate(false);
        setBulkClassIds([]);
        setBulkNominal("");
        fetch("/api/classrooms").then(r => r.json()).then(j => { if (j.success) setClassrooms(j.data || []); }).catch(() => {});
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal memperbarui biaya kelas", "error"); }
    finally { setBulkLoading(false); }
  }

  function toggleGenMonth(m: number) {
    setGenMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  const thStyle: React.CSSProperties = { padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" };
  
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: toast.type === "success" ? "#059669" : "#e11d48", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <FilterBar />

      {/* Hero Header */}
      <PageHeader
        title="Tagihan Infaq / SPP"
        subtitle="Monitor tagihan sesuai filter periode yang dipilih."
        icon={<Wallet />}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowBulkUpdate(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-bold text-xs uppercase tracking-wide border border-indigo-100 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Setting Biaya
            </button>
            <button
              onClick={async () => {
                // Cek nominal kelas sebelum buka form generate
                const zeroClasses = classrooms.filter((c: any) => !c.infaqNominal || c.infaqNominal <= 0);
                if (zeroClasses.length > 0) {
                  const classNames = zeroClasses.map((c: any) => c.name).join(", ");
                  const result = await Swal.fire({
                    title: "⚠️ Nominal Belum Diatur!",
                    html: `
                      <div style="text-align: left; font-size: 0.875rem; color: #334155;">
                        <p>Sebelum generate tagihan, nominal SPP/Infaq <strong>wajib</strong> diatur terlebih dahulu.</p>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem 1rem; border-radius: 0.75rem; margin: 0.75rem 0;">
                          <p style="font-weight: 600; color: #dc2626; margin: 0 0 0.375rem 0; font-size: 0.8125rem">Kelas yang belum ada nominal:</p>
                          <p style="color: #991b1b; margin: 0; font-family: monospace; font-size: 0.8125rem;">${classNames}</p>
                        </div>
                        <p style="color: #64748b; font-size: 0.8125rem; margin-top: 0.5rem;">Klik <strong>"Atur Biaya Sekarang"</strong> untuk mengisi nominal per kelas.</p>
                      </div>
                    `,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#6366f1",
                    cancelButtonColor: "#94a3b8",
                    confirmButtonText: "Atur Biaya Sekarang",
                    cancelButtonText: "Batal",
                  });
                  if (result.isConfirmed) {
                    setShowBulkUpdate(true);
                  }
                  return;
                }
                setShowGenerate(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors shadow-sm"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Generate Tagihan
            </button>
            <button
              onClick={() => setShowReset(true)}
              className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs uppercase tracking-wide border border-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Tagihan
            </button>
          </div>
        }
      />

      {/* Tabel Tagihan */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Daftar Tagihan</h4>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{pagination.total} Data</span>
        </div>
        {data.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100">
            <ExportButtons options={{
              title: "Daftar Tagihan Infaq / SPP",
              filename: `tagihan_infaq_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 10, align: "center" },
                { header: "Siswa", key: "student_name", width: 40 },
                { header: "Kelas", key: "classroom", width: 20 },
                { header: "Periode", key: "_periode", width: 25 },
                { header: "Nominal", key: "nominal", width: 25, align: "right", format: (v: number) => fmtRupiah(v) },
                { header: "Status", key: "status", width: 20, align: "center", format: (v: string) => v === 'lunas' ? 'Lunas' : v === 'sebagian' ? 'Sebagian' : v === 'void' ? 'Void' : 'Belum Lunas' },
              ],
              data: data.map((b: any, i: number) => ({
                ...b,
                _no: ((pagination.page - 1) * pagination.limit) + i + 1,
                _periode: `${b.month || '-'} ${b.academic_year || b.year || '-'}`,
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Siswa</th>
                <th style={thStyle}>Kelas</th>
                <th style={thStyle}>Periode</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Nominal</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#d97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Tagihan</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>Periksa filter Anda atau klik <strong>Generate Tagihan</strong>.</p>
                  </div>
                </td></tr>
              ) : data.map((b: any, i: number) => {
                const idx = ((pagination.page - 1) * pagination.limit) + i + 1;
                const initial = (b.student_name || "?").charAt(0).toUpperCase();
                let statusBadge;
                if (b.status === "lunas") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}>✓ Lunas</span>;
                else if (b.status === "sebagian") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", borderRadius: 999 }}>◐ Sebagian</span>;
                else if (b.status === "belum_lunas") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#be123c", background: "#ffe4e6", borderRadius: 999 }}>✗ Belum Lunas</span>;
                else statusBadge = <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", background: "#e5e7eb", borderRadius: 999 }}>Void</span>;

                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: b.status === "void" ? 0.45 : 1 }}>
                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{idx}</td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#b45309" }}>{initial}</div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{b.student_name || "-"}</p>
                          <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{b.nisn || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}><span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{b.classroom || "-"}</span></td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{b.month || "-"}</p>
                      <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{b.academic_year || b.year || "-"}</p>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      {b.nominal <= 0 ? <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#059669" }}>GRATIS</span> : <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#1e293b" }}>Rp {Number(b.nominal).toLocaleString("id-ID")}</span>}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center", position: "relative" }}>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          (e.nativeEvent as any).stopImmediatePropagation();
                          setOpenActionId(openActionId === b.id ? null : b.id); 
                        }}
                        style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                        className="hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>

                      {openActionId === b.id && (
                        <div 
                          style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "160px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem" }}>
                            Aksi Tagihan
                          </div>

                          <button onClick={() => { setOpenActionId(null); router.push("/infaq-bills/tracking"); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#0ea5e9", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-sky-50">
                            Tracking
                          </button>

                          {b.status === "belum_lunas" || b.status === "sebagian" ? (
                            <>
                              <button onClick={() => { setOpenActionId(null); setSelectedBill(b); setPayAmount(String(b.nominal - (b.total_paid || 0))); setShowPayment(true); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#059669", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-emerald-50">
                                Bayar Tagihan
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleEditNominal(b); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#6366f1", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-indigo-50">
                                Edit Nominal
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleVoid(b.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#e11d48", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-rose-50">
                                Void (Batalkan)
                              </button>
                              <button onClick={() => { setOpenActionId(null); handleDelete(b.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-slate-100">
                                Hapus Tagihan
                              </button>
                            </>
                          ) : b.status === "lunas" ? (
                            <button onClick={() => { setOpenActionId(null); handleRevert(b.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, color: "#d97706", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-amber-50">
                              Revert (Belum Lunas)
                            </button>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination 
          page={pagination.page} 
          totalPages={pagination.totalPages} 
          total={pagination.total} 
          limit={pagination.limit} 
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            window.history.pushState({}, "", `?${params.toString()}`);
            refreshData();
          }} 
          onLimitChange={(l) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("limit", String(l));
            params.set("page", "1");
            window.history.pushState({}, "", `?${params.toString()}`);
            refreshData();
          }} 
        />
      </Card>

      {/* Modal Generate Tagihan */}
      {showGenerate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowGenerate(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 520, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Generate Tagihan Baru</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>Pilih periode dan tahun untuk generate tagihan infaq/SPP.</p>

            {/* Toggle Periode: Bulanan / Semester */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem", marginBottom: "1rem" }}>
              {(["bulanan", "semester", "tahunan"] as const).map(p => (
                <button key={p} onClick={() => setGenPeriod(p)} style={{
                  flex: 1, padding: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, borderRadius: "0.625rem", border: "2px solid",
                  borderColor: genPeriod === p ? "#f59e0b" : "#e2e8f0",
                  background: genPeriod === p ? "#fef3c7" : "#fff",
                  color: genPeriod === p ? "#b45309" : "#64748b", cursor: "pointer", textTransform: "capitalize",
                }}>{p === "tahunan" ? "1 Tahun" : p}</button>
              ))}
            </div>

            {genPeriod === "bulanan" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pilih Bulan</label>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button onClick={() => setGenMonths([1,2,3,4,5,6,7,8,9,10,11,12])} style={{ padding: "0.25rem 0.5rem", fontSize: "0.625rem", fontWeight: 700, borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#1e293b", cursor: "pointer" }}>Semua</button>
                    <button onClick={() => setGenMonths([7,8,9,10,11,12])} style={{ padding: "0.25rem 0.5rem", fontSize: "0.625rem", fontWeight: 700, borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#6366f1", cursor: "pointer" }}>Jul-Des</button>
                    <button onClick={() => setGenMonths([1,2,3,4,5,6])} style={{ padding: "0.25rem 0.5rem", fontSize: "0.625rem", fontWeight: 700, borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#4f46e5", cursor: "pointer" }}>Jan-Jun</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                  {Array.from({length: 12}).map((_, i) => {
                    const m = i + 1;
                    const selected = genMonths.includes(m);
                    return (
                      <button key={m} onClick={() => toggleGenMonth(m)} style={{ padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, border: selected ? "2px solid #f59e0b" : "1.5px solid #e2e8f0", background: selected ? "#fef3c7" : "#fff", color: selected ? "#b45309" : "#64748b", cursor: "pointer" }}>
                        {monthNames[m]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : genPeriod === "semester" ? (
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Pilih Semester</label>
                <select value={genSemester} onChange={e => setGenSemester(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                  <option value="1">Semester 1 (Juli – Desember)</option>
                  <option value="2">Semester 2 (Januari – Juni)</option>
                </select>
                <p style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "0.375rem" }}>
                  Akan auto-generate tagihan untuk 6 bulan sekaligus.
                </p>
              </div>
            ) : (
              <div style={{ padding: "1rem", borderRadius: "0.625rem", background: "#fef3c7", border: "1px solid #fde68a" }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#b45309", margin: 0 }}>📅 1 Tahun Ajaran Penuh</p>
                <p style={{ fontSize: "0.75rem", color: "#92400e", marginTop: "0.375rem" }}>
                  Akan auto-generate tagihan untuk 12 bulan sekaligus (Juli – Juni).
                </p>
              </div>
            )}

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tahun Akademik</label>
              <select value={genAcademicYearId} onChange={e => setGenAcademicYearId(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">-- Pilih Tahun Akademik --</option>
                {academicYears.map((ay: any) => <option key={ay.id} value={ay.id}>{ay.year} {ay.isActive ? "(Aktif)" : ""}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Target Kelas</label>
              <select value={genClassroomId} onChange={e => setGenClassroomId(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">Semua Kelas</option>
                {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tahun</label>
              <input type="text" value={genYear} onChange={e => setGenYear(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowGenerate(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handleGenerate} disabled={genLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: genLoading ? "#94a3b8" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "0.625rem", cursor: genLoading ? "not-allowed" : "pointer" }}>
                {genLoading ? "Memproses..." : genPeriod === "tahunan" ? "Generate 1 Tahun" : genPeriod === "semester" ? `Generate Semester ${genSemester}` : `Generate ${genMonths.length} Bulan`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bayar Tagihan */}
      {showPayment && selectedBill && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPayment(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 440, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Bayar Tagihan</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>{selectedBill.student_name} — {selectedBill.month} {selectedBill.year}</p>
            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Nominal Tagihan</span>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>Rp {Number(selectedBill.nominal).toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Metode Pembayaran</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="tabungan">Potong Tabungan</option>
              </select>
            </div>
            {payMethod !== "tabungan" && (
              <div style={{ marginTop: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Akun Kas</label>
                <select value={payCashId} onChange={e => setPayCashId(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                  <option value="">— Pilih Akun Kas —</option>
                  {cashAccounts.map((ca: any) => <option key={ca.id} value={ca.id}>{ca.name} (Rp {Number(ca.balance).toLocaleString("id-ID")})</option>)}
                </select>
              </div>
            )}
            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Jumlah Bayar</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tanggal Bayar</label>
              <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Catatan (opsional)</label>
              <input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="Keterangan..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowPayment(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handlePayment} disabled={payLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: payLoading ? "#94a3b8" : "linear-gradient(135deg,#059669,#047857)", border: "none", borderRadius: "0.625rem", cursor: payLoading ? "not-allowed" : "pointer" }}>
                {payLoading ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Tagihan */}
      {showReset && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setShowReset(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#ef4444", margin: "0 0 0.25rem" }}>🔄 Reset Tagihan</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 1.25rem" }}>Hapus tagihan beserta pembayarannya agar bisa di-generate ulang.</p>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["semester", "bulan"] as const).map(m => (
                <button key={m} onClick={() => setResetMode(m)} style={{ flex: 1, padding: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, borderRadius: "0.5rem", border: "1.5px solid", borderColor: resetMode === m ? "#6366f1" : "#e2e8f0", background: resetMode === m ? "#eef2ff" : "#fff", color: resetMode === m ? "#4f46e5" : "#64748b", cursor: "pointer" }}>{m === "semester" ? "Per Semester" : "Per Bulan"}</button>
              ))}
            </div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Tahun</label>
            <select value={resetYear} onChange={e => setResetYear(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {resetMode === "semester" ? (
              <>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Semester</label>
                <select value={resetSemester} onChange={e => setResetSemester(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                  <option value="1">Semester 1 (Jul–Des)</option>
                  <option value="2">Semester 2 (Jan–Jun)</option>
                </select>
              </>
            ) : (
              <>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.375rem" }}>Pilih Bulan</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.375rem", marginBottom: "0.75rem" }}>
                  {Object.entries(monthShort).map(([num, name]) => {
                    const n = Number(num);
                    const sel = resetMonths.includes(n);
                    return (<button key={n} onClick={() => setResetMonths(sel ? resetMonths.filter(x => x !== n) : [...resetMonths, n])} style={{ padding: "0.375rem", fontSize: "0.75rem", fontWeight: 600, borderRadius: "0.375rem", border: "1.5px solid", cursor: "pointer", borderColor: sel ? "#6366f1" : "#e2e8f0", background: sel ? "#eef2ff" : "#fff", color: sel ? "#4f46e5" : "#64748b" }}>{name}</button>);
                  })}
                </div>
              </>
            )}
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>Kelas (Opsional)</label>
            <select value={resetClassId} onChange={e => setResetClassId(e.target.value)} style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "1rem" }}>
              <option value="">Semua Kelas</option>
              {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ padding: "0.625rem 0.75rem", borderRadius: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#991b1b", margin: 0, fontWeight: 600 }}>⚠️ Tagihan dan pembayaran terkait akan dihapus secara permanen.</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowReset(false)} style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>Batal</button>
              <button disabled={resetLoading} onClick={async () => {
                const reqBody: any = { year: resetYear };
                if (resetMode === "semester") reqBody.semester = Number(resetSemester);
                else reqBody.months = resetMonths;
                if (resetClassId) reqBody.classroomId = Number(resetClassId);
                if (resetMode === "bulan" && resetMonths.length === 0) { showToast("Pilih minimal 1 bulan", "error"); return; }
                const result = await Swal.fire({ title: "Reset Tagihan?", text: "YAKIN reset tagihan ini? Data pembayaran juga akan dihapus!", icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48", cancelButtonColor: "#64748b", confirmButtonText: "Ya, Reset" });
                if (!result.isConfirmed) return;
                setResetLoading(true);
                try {
                  const res = await fetch("/api/infaq-bills/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reqBody) });
                  const json = await res.json();
                  if (json.success) { showToast(json.message); setShowReset(false); refreshData(); } else showToast(json.message, "error");
                } catch { showToast("Gagal reset", "error"); } finally { setResetLoading(false); }
              }} style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: resetLoading ? "#94a3b8" : "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", borderRadius: "0.5rem", cursor: resetLoading ? "not-allowed" : "pointer" }}>{resetLoading ? "Memproses..." : "Reset Sekarang"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setting Biaya Masal */}
      {showBulkUpdate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setShowBulkUpdate(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", padding: "2rem", width: "100%", maxWidth: 500, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: "0 0 0.25rem" }}>⚙️ Pengaturan Biaya SPP Masal</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 1.5rem" }}>Update nominal biaya SPP standar untuk kelas yang dipilih.</p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Filter Tahun Akademik</label>
              <select value={bulkYearId} onChange={e => { const yId = e.target.value; setBulkYearId(yId); if (yId) { setBulkClassIds(classrooms.filter(c => c.academicYearId === Number(yId)).map(c => c.id)); } else { setBulkClassIds([]); } }} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">-- Semua Tahun Akademik --</option>
                {academicYears.map((ay: any) => <option key={ay.id} value={ay.id}>{ay.year} {ay.isActive ? "(Aktif)" : ""}</option>)}
              </select>
            </div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Pilih Kelas</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", maxHeight: "160px", overflowY: "auto", padding: "0.5rem", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", marginBottom: "1rem" }}>
              <button onClick={() => { const tc = bulkYearId ? classrooms.filter(c => c.academicYearId === Number(bulkYearId)) : classrooms; if (bulkClassIds.length === tc.length) setBulkClassIds([]); else setBulkClassIds(tc.map(c => c.id)); }} style={{ gridColumn: "span 3", padding: "0.375rem", fontSize: "0.75rem", fontWeight: 700, borderRadius: "0.375rem", border: "1px dashed #6366f1", background: "#f5f3ff", color: "#4f46e5", cursor: "pointer", marginBottom: "0.25rem" }}>
                {bulkClassIds.length > 0 && bulkClassIds.length === (bulkYearId ? classrooms.filter(c => c.academicYearId === Number(bulkYearId)).length : classrooms.length) ? "Hapus Semua Pilihan" : "Pilih Semua Kelas Terfilter"}
              </button>
              {(bulkYearId ? classrooms.filter(c => c.academicYearId === Number(bulkYearId)) : classrooms).map((c: any) => {
                const isSel = bulkClassIds.includes(c.id);
                return (<button key={c.id} onClick={() => setBulkClassIds(prev => isSel ? prev.filter(id => id !== c.id) : [...prev, c.id])} style={{ padding: "0.5rem", fontSize: "0.75rem", fontWeight: 600, borderRadius: "0.5rem", border: "1.5px solid", borderColor: isSel ? "#6366f1" : "#e2e8f0", background: isSel ? "#eef2ff" : "#fff", color: isSel ? "#4f46e5" : "#64748b", cursor: "pointer" }}>{c.name}</button>);
              })}
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nominal Biaya Baru (Rp)</label>
                {bulkClassIds.length > 0 && (<span style={{ fontSize: "0.65rem", color: "#6366f1", fontWeight: 700, background: "#eef2ff", padding: "0.15rem 0.5rem", borderRadius: "0.25rem" }}>Tarif Lama: {(() => { const sel = classrooms.filter(c => bulkClassIds.includes(c.id)); const noms = sel.map(c => c.infaqNominal || 0); const mn = Math.min(...noms); const mx = Math.max(...noms); return mn === mx ? `Rp ${mn.toLocaleString("id-ID")}` : `Rp ${mn.toLocaleString("id-ID")} - Rp ${mx.toLocaleString("id-ID")}`; })()}</span>)}
              </div>
              <input type="number" value={bulkNominal} onChange={e => setBulkNominal(e.target.value)} placeholder="Masukkan nominal baru..." style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", fontSize: "1rem", fontWeight: 700, outline: "none" }} className="focus:border-indigo-500" />
              {bulkNominal && bulkClassIds.length > 0 && (<p style={{ fontSize: "0.7rem", color: "#059669", fontWeight: 600, marginTop: "0.5rem" }}>✨ Semua kelas terpilih akan diseragamkan menjadi <strong>Rp {Number(bulkNominal).toLocaleString("id-ID")}</strong></p>)}
            </div>
            <div style={{ padding: "0.75rem", borderRadius: "0.75rem", background: "#fffbeb", border: "1px solid #fde68a", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#92400e", margin: 0, lineHeight: 1.5 }}><strong>Catatan:</strong> Perubahan ini akan mengupdate biaya standar di tingkat kelas. Tagihan yang <strong>akan</strong> datang akan menggunakan nominal baru ini.</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowBulkUpdate(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button disabled={bulkLoading} onClick={handleBulkUpdate} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: bulkLoading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.625rem", cursor: bulkLoading ? "not-allowed" : "pointer" }}>
                {bulkLoading ? "Memproses..." : `Update ${bulkClassIds.length} Kelas`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InfaqBillsPage() {
  return (
    <Suspense fallback={<div>Loading Infaq Bills...</div>}>
      <InfaqBillsContent />
    </Suspense>
  );
}
