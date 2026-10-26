"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { Gift, ArrowUpRight, ArrowDownLeft, CheckCircle2, Trash2 } from "lucide-react";

interface WakafTransaction {
  id: number;
  date: string;
  amount: number;
  type: "in" | "out";
  donor_name: string;
  purpose_name: string;
  status: string;
}

interface WakafDonor {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

interface WakafPurpose {
  id: number;
  name: string;
  description?: string;
}

interface CashAccount {
  id: number;
  name: string;
  accountName?: string; // Menampung field dari API
}

const SUPPORTED_WAKAF_FILTER_KEYS = [
  "academicYearId",
  "semester",
  "month",
  "type",
  "donorId",
  "purposeId",
];

export default function WakafPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WakafContent />
    </Suspense>
  );
}

function WakafContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("riwayat"); // riwayat, donatur, tujuan
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedDonorIds, setSelectedDonorIds] = useState<number[]>([]);
  const [selectedPurposeIds, setSelectedPurposeIds] = useState<number[]>([]);

  // Drawer states
  const [drawerTrxOpen, setDrawerTrxOpen] = useState(false);
  const [drawerTrxType, setDrawerTrxType] = useState<"in" | "out">("in");
  const [trxLoading, setTrxLoading] = useState(false);
  const [trxForm, setTrxForm] = useState({
    date: new Date().toISOString().split("T")[0],
    donorId: "",
    purposeId: "",
    cashAccountId: "",
    amount: "",
    description: "",
  });

  const [drawerDonorOpen, setDrawerDonorOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<WakafDonor | null>(null);
  const [donorLoading, setDonorLoading] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [drawerPurposeOpen, setDrawerPurposeOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<WakafPurpose | null>(null);
  const [purposeLoading, setPurposeLoading] = useState(false);
  const [purposeForm, setPurposeForm] = useState({
    name: "",
    description: "",
  });
  const wakafParams = new URLSearchParams();

  SUPPORTED_WAKAF_FILTER_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      wakafParams.set(key, value);
    }
  });

  const queryString = wakafParams.toString();
  const selectedDonorId = searchParams.get("donorId") || "";
  const selectedPurposeId = searchParams.get("purposeId") || "";

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    let hasUnsupportedParams = false;

    Array.from(currentParams.keys()).forEach((key) => {
      if (!SUPPORTED_WAKAF_FILTER_KEYS.includes(key)) {
        currentParams.delete(key);
        hasUnsupportedParams = true;
      }
    });

    if (hasUnsupportedParams) {
      const nextQuery = currentParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    }
  }, [pathname, router, searchParams]);

  const { data: wakafQuery } = useQuery({
    queryKey: ["wakaf", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/wakaf?${queryString}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const { data: donorsQuery } = useQuery({
    queryKey: ["wakaf-donors"],
    queryFn: async () => {
      const res = await fetch("/api/wakaf/donors");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: purposesQuery } = useQuery({
    queryKey: ["wakaf-purposes"],
    queryFn: async () => {
      const res = await fetch("/api/wakaf/purposes");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: cashAccountsQuery } = useQuery({
    queryKey: ["cash-account-options"],
    queryFn: async () => {
      const res = await fetch("/api/cash-accounts?options=true");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const data: WakafTransaction[] = wakafQuery?.success ? wakafQuery.transactions || [] : [];
  const kpi = wakafQuery?.success ? wakafQuery.kpi || {
    totalIn: 0,
    totalOut: 0,
    netBalance: 0,
    periodIn: 0,
    periodOut: 0,
    donorCount: 0,
    purposeCount: 0
  } : {
    totalIn: 0,
    totalOut: 0,
    netBalance: 0,
    periodIn: 0,
    periodOut: 0,
    donorCount: 0,
    purposeCount: 0
  };
  const donors: WakafDonor[] = donorsQuery?.success ? donorsQuery.data || [] : [];
  const purposes: WakafPurpose[] = purposesQuery?.success ? purposesQuery.data || [] : [];
  const cashAccounts: CashAccount[] = (cashAccountsQuery?.success ? cashAccountsQuery.data || [] : []).map((account: CashAccount) => ({
    ...account,
    name: account.accountName || account.name,
  }));

  const hasActiveFilter = Boolean(
    searchParams.get("academicYearId") ||
    searchParams.get("semester") ||
    searchParams.get("month") ||
    searchParams.get("type") ||
    selectedDonorId ||
    selectedPurposeId
  );
  const totalInCaption = hasActiveFilter ? `Filter aktif: +${fmtRp(kpi.periodIn)}` : "total semua data";
  const totalOutCaption = hasActiveFilter ? `Filter aktif: -${fmtRp(kpi.periodOut)}` : "total semua data";

  const [openActionId, setOpenActionId] = useState<number | null>(null);

  useEffect(() => {
    function handleClickOutside() {
      setOpenActionId(null);
    }
    if (openActionId !== null) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);
  const refreshWakafData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["wakaf"] });
    queryClient.invalidateQueries({ queryKey: ["cash-accounts"] });
    queryClient.invalidateQueries({ queryKey: ["cash-account-options"] });
  }, [queryClient]);

  const refreshDonors = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["wakaf-donors"] });
  }, [queryClient]);

  const refreshPurposes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["wakaf-purposes"] });
  }, [queryClient]);

  const updateWakafFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }, [pathname, router, searchParams]);

  const clearDonorPurposeFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("donorId");
    params.delete("purposeId");
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }, [pathname, router, searchParams]);

  function fmtRp(n: number) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  // --- ACTIONS TRANSAKSI ---
  const handleRecordTransaction = (type: "in" | "out") => {
    setDrawerTrxType(type);
    setTrxForm({
      date: new Date().toISOString().split("T")[0],
      donorId: "",
      purposeId: "",
      cashAccountId: "",
      amount: "",
      description: "",
    });
    setDrawerTrxOpen(true);
  };

  const handleSubmitTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((drawerTrxType === "in" && !trxForm.donorId) || !trxForm.amount || !trxForm.purposeId || !trxForm.cashAccountId) {
      Swal.fire("Error", "Mohon lengkapi semua kolom wajib!", "error");
      return;
    }
    setTrxLoading(true);
    try {
      const res = await fetch("/api/wakaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: drawerTrxType,
          date: trxForm.date,
          donorId: drawerTrxType === "in" ? Number(trxForm.donorId) : null,
          purposeId: Number(trxForm.purposeId),
          cashAccountId: Number(trxForm.cashAccountId),
          amount: Number(trxForm.amount),
          description: trxForm.description,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        Swal.fire("Berhasil", json.message, "success");
        setDrawerTrxOpen(false);
        refreshWakafData();
      } else {
        Swal.fire("Gagal", json.error || "Gagal menyimpan", "error");
      }
    } catch {
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    } finally {
      setTrxLoading(false);
    }
  };

  const handleDeleteWakaf = async (id: number) => {
    Swal.fire({
      title: "Void Transaksi?",
      text: "Transaksi ini akan divoid dan saldo akan dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Void"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/wakaf/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) {
            Swal.fire("Berhasil", "Transaksi di-void.", "success");
            refreshWakafData();
          } else Swal.fire("Gagal", json.error || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleBulkDeleteWakaf = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Void Transaksi Terpilih?",
      text: `${selectedIds.length} transaksi wakaf akan divoid dan saldo kas akan disesuaikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Void (${selectedIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/wakaf/${id}`, { method: "DELETE" })));
      Swal.fire("Berhasil", `${selectedIds.length} transaksi berhasil divoid.`, "success");
      setSelectedIds([]);
      refreshWakafData();
    } catch {
      Swal.fire("Error", "Gagal void beberapa transaksi", "error");
    }
  };

  // Donatur Actions
  const handleAddDonor = () => {
    setEditingDonor(null);
    setDonorForm({ name: "", phone: "", address: "" });
    setDrawerDonorOpen(true);
  };

  const handleEditDonor = (d: WakafDonor) => {
    setEditingDonor(d);
    setDonorForm({ name: d.name, phone: d.phone || "", address: d.address || "" });
    setDrawerDonorOpen(true);
  };

  const handleSubmitDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorForm.name) {
      Swal.fire("Error", "Nama donatur wajib diisi!", "error");
      return;
    }
    setDonorLoading(true);
    try {
      const url = "/api/wakaf/donors";
      const method = editingDonor ? "PUT" : "POST";
      const payload = editingDonor ? { id: editingDonor.id, ...donorForm } : donorForm;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        Swal.fire("Berhasil", editingDonor ? "Donatur diperbarui" : "Donatur ditambahkan", "success");
        setDrawerDonorOpen(false);
        refreshDonors();
      } else {
        Swal.fire("Gagal", json.error || json.message || "Gagal", "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    } finally {
      setDonorLoading(false);
    }
  };

  const handleDeleteDonor = async (id: number) => {
    Swal.fire({
      title: "Hapus Donatur?",
      text: "Data donatur akan dihapus dari sistem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/wakaf/donors`, { 
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Donatur dihapus", "success"); refreshDonors(); }
          else Swal.fire("Gagal", json.error || json.message, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleBulkDeleteDonors = async () => {
    if (selectedDonorIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Donatur Terpilih?",
      text: `${selectedDonorIds.length} data donatur akan dihapus dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedDonorIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedDonorIds.map(id => fetch(`/api/wakaf/donors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })));
      Swal.fire("Berhasil", `${selectedDonorIds.length} donatur berhasil dihapus.`, "success");
      setSelectedDonorIds([]);
      refreshDonors();
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa donatur", "error");
    }
  };

  // Purpose Actions
  const handleAddPurpose = () => {
    setEditingPurpose(null);
    setPurposeForm({ name: "", description: "" });
    setDrawerPurposeOpen(true);
  };

  const handleEditPurpose = (p: WakafPurpose) => {
    setEditingPurpose(p);
    setPurposeForm({ name: p.name, description: p.description || "" });
    setDrawerPurposeOpen(true);
  };

  const handleSubmitPurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purposeForm.name) {
      Swal.fire("Error", "Nama program tujuan wajib diisi!", "error");
      return;
    }
    setPurposeLoading(true);
    try {
      const url = "/api/wakaf/purposes";
      const method = editingPurpose ? "PUT" : "POST";
      const payload = editingPurpose ? { id: editingPurpose.id, ...purposeForm } : purposeForm;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        Swal.fire("Berhasil", editingPurpose ? "Program diperbarui" : "Tujuan ditambahkan", "success");
        setDrawerPurposeOpen(false);
        refreshPurposes();
      } else {
        Swal.fire("Gagal", json.error || json.message || "Gagal", "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    } finally {
      setPurposeLoading(false);
    }
  };



  const handleDeletePurpose = async (id: number) => {
    Swal.fire({
      title: "Hapus Tujuan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/wakaf/purposes`, { 
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
          });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Dihapus", "success"); refreshPurposes(); }
          else Swal.fire("Gagal", json.error, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleBulkDeletePurposes = async () => {
    if (selectedPurposeIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Program Terpilih?",
      text: `${selectedPurposeIds.length} data program akan dihapus dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedPurposeIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedPurposeIds.map(id => fetch(`/api/wakaf/purposes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })));
      Swal.fire("Berhasil", `${selectedPurposeIds.length} program berhasil dihapus.`, "success");
      setSelectedPurposeIds([]);
      refreshPurposes();
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa program", "error");
    }
  };



  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Wakaf & Donasi"
        subtitle="Kelola penerimaan dan penyaluran dana wakaf madrasah."
        icon={<Gift className="w-5 h-5 text-blue-600" />}
      />

      <FilterBar 
        visibleFilters={["academicYear", "semester", "month", "type"]}
        customTypeOptions={[
          { label: "Masuk (Penerimaan)", value: "in" },
          { label: "Keluar (Penyaluran)", value: "out" },
        ]}
      />

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="min-w-[220px] flex-1">
          <label className="ml-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Donatur
          </label>
          <select
            value={selectedDonorId}
            onChange={(event) => updateWakafFilter("donorId", event.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Semua Donatur</option>
            {donors.map((donor) => (
              <option key={donor.id} value={String(donor.id)}>
                {donor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[220px] flex-1">
          <label className="ml-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Program
          </label>
          <select
            value={selectedPurposeId}
            onChange={(event) => updateWakafFilter("purposeId", event.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Semua Program</option>
            {purposes.map((purpose) => (
              <option key={purpose.id} value={String(purpose.id)}>
                {purpose.name}
              </option>
            ))}
          </select>
        </div>

        {(selectedDonorId || selectedPurposeId) && (
          <button
            onClick={clearDonorPurposeFilters}
            className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            Reset Donatur/Program
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-emerald-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Terkumpul</p>
          <p className="text-xl font-extrabold text-emerald-600">{fmtRp(kpi.totalIn)}</p>
          <div className="mt-2 flex items-center text-[10px] text-slate-400">
            <span className="font-bold text-emerald-500">{totalInCaption}</span>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-rose-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Penyaluran</p>
          <p className="text-xl font-extrabold text-rose-600">{fmtRp(kpi.totalOut)}</p>
          <div className="mt-2 flex items-center text-[10px] text-slate-400">
            <span className="font-bold text-rose-500">{totalOutCaption}</span>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-blue-500 shadow-sm bg-blue-50/30">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Saldo Wakaf (Net)</p>
          <p className="text-xl font-extrabold text-blue-600">{fmtRp(kpi.netBalance)}</p>
          <p className="mt-2 text-[10px] text-slate-400 italic">Total kas wakaf tersedia</p>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Donatur</p>
            <p className="text-lg font-bold text-slate-700">{kpi.donorCount}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Program</p>
            <p className="text-lg font-bold text-slate-700">{kpi.purposeCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab("riwayat")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "riwayat" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>Riwayat Transaksi</button>
        <button onClick={() => setActiveTab("donatur")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "donatur" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>Donatur</button>
        <button onClick={() => setActiveTab("tujuan")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "tujuan" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>Program & Penyaluran</button>
      </div>

      {/* Panel Riwayat */}
      {activeTab === "riwayat" && (
        <Card className="animate-fade-in overflow-hidden">
          {selectedIds.length > 0 && (
            <div className="mx-5 my-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedIds.length} transaksi wakaf dipilih</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkDeleteWakaf}
                  className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Void Terpilih ({selectedIds.length})</span>
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
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Riwayat Keuangan Wakaf</h4>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRecordTransaction("in")} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 shadow-sm flex items-center gap-1.5">
                <ArrowDownLeft size={14} /> + Wakaf Masuk
              </button>
              <button onClick={() => handleRecordTransaction("out")} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 shadow-sm flex items-center gap-1.5">
                <ArrowUpRight size={14} /> + Penyaluran
              </button>
              {data.length > 0 && (
                <ExportButtons options={{
                  title: "Laporan Keuangan Wakaf",
                  filename: `wakaf_${new Date().toISOString().split("T")[0]}`,
                  columns: [
                    { header: "No", key: "_no", width: 8, align: "center" },
                    { header: "Tanggal", key: "_date", width: 15 },
                    { header: "Tipe", key: "type", width: 10 },
                    { header: "Keterangan", key: "donor_name", width: 25 },
                    { header: "Program", key: "purpose_name", width: 25 },
                    { header: "Nominal", key: "amount", width: 20, align: "right", format: (v: unknown) => fmtRupiah(Number(v)) },
                    { header: "Status", key: "_status", width: 10, align: "center" },
                  ],
                  data: data.map((t, i) => ({
                    ...t,
                    _no: ((page - 1) * limit) + i + 1,
                    _date: new Date(t.date).toLocaleDateString("id-ID"),
                    _status: t.status === 'void' ? 'VOID' : 'VALID',
                  })),
                }} />
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-4 border-b border-slate-200 text-center w-10">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? data.map(t => t.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua transaksi"
                    />
                  </th>
                  <th className="px-3 py-4 border-b border-slate-200 text-center w-12">No</th>
                  <th className="px-6 py-4 border-b border-slate-200">Tanggal</th>
                  <th className="px-6 py-4 border-b border-slate-200">Keterangan</th>
                  <th className="px-6 py-4 border-b border-slate-200">Program</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Nominal</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400 border-b border-slate-100">Belum ada transaksi ditemukan</td>
                  </tr>
                )}
                {data.slice((page - 1) * limit, page * limit).map((t, i) => {
                  const isSelected = selectedIds.includes(t.id);
                  return (
                  <tr key={t.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`} style={{ opacity: t.status === 'void' ? 0.5 : 1}}>
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, t.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== t.id));
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        aria-label={`Pilih transaksi ${t.donor_name}`}
                      />
                    </td>
                    <td className="px-3 py-4 text-center text-xs font-mono font-medium text-slate-400">{((page - 1) * limit) + i + 1}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(t.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${t.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.type === 'in' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-tight">{t.donor_name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">{t.type === 'in' ? 'Masuk' : 'Keluar'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{t.purpose_name}</span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-extrabold text-right ${t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'in' ? '+' : '-'}{fmtRp(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      {t.status !== 'void' ? (
                        <button 
                          onClick={(ev) => { 
                            ev.stopPropagation(); 
                            setOpenActionId(openActionId === t.id ? null : t.id); 
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                        >
                          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      ) : <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded">VOID</span>}

                      {openActionId === t.id && (
                        <div className="absolute top-10 right-10 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1 min-w-[120px]">
                          <button onClick={() => handleDeleteWakaf(t.id)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2">
                            Void Transaksi
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
          <div className="p-5 bg-slate-50/30 border-t border-slate-100">
            <Pagination page={page} totalPages={Math.ceil(data.length / limit) || 1} total={data.length} limit={limit} onPageChange={(p) => setPage(p)} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
          </div>
        </Card>
      )}

      {/* Tab Donatur */}
      {activeTab === "donatur" && (
        <Card className="animate-fade-in overflow-hidden">
          {selectedDonorIds.length > 0 && (
            <div className="mx-5 my-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedDonorIds.length} donatur dipilih</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkDeleteDonors}
                  className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedDonorIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDonorIds([])}
                  className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Basis Data Donatur</h4>
            </div>
            <button onClick={handleAddDonor} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm">+ Donatur Baru</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-4 border-b border-slate-200 text-center w-10">
                    <input
                      type="checkbox"
                      checked={donors.length > 0 && selectedDonorIds.length === donors.length}
                      onChange={(e) => setSelectedDonorIds(e.target.checked ? donors.map(d => d.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua donatur"
                    />
                  </th>
                  <th className="px-4 py-4 border-b border-slate-200 text-center w-12">No</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nama Lengkap</th>
                  <th className="px-6 py-4 border-b border-slate-200">No HP</th>
                  <th className="px-6 py-4 border-b border-slate-200">Alamat</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-xs text-slate-400">Belum ada data donatur</td></tr>
                ) : donors.map((d, i: number) => {
                  const isSelected = selectedDonorIds.includes(d.id);
                  return (
                    <tr key={d.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDonorIds(prev => [...prev, d.id]);
                            else setSelectedDonorIds(prev => prev.filter(id => id !== d.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{d.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{d.phone || "-"}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{d.address || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEditDonor(d)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 mr-2">
                          <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteDonor(d.id)} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 border border-rose-100">
                          <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Tujuan */}
      {activeTab === "tujuan" && (
        <Card className="animate-fade-in overflow-hidden">
          {selectedPurposeIds.length > 0 && (
            <div className="mx-5 my-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{selectedPurposeIds.length} program dipilih</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkDeletePurposes}
                  className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih ({selectedPurposeIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPurposeIds([])}
                  className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Program & Penyaluran Wakaf</h4>
            </div>
            <button onClick={handleAddPurpose} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm">+ Tambah Program</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-3 py-4 border-b border-slate-200 text-center w-10">
                    <input
                      type="checkbox"
                      checked={purposes.length > 0 && selectedPurposeIds.length === purposes.length}
                      onChange={(e) => setSelectedPurposeIds(e.target.checked ? purposes.map(p => p.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua program"
                    />
                  </th>
                  <th className="px-4 py-4 border-b border-slate-200 text-center w-12">No</th>
                  <th className="px-6 py-4 border-b border-slate-200">Nama Program</th>
                  <th className="px-6 py-4 border-b border-slate-200">Deskripsi</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {purposes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-xs text-slate-400">Belum ada data program</td></tr>
                ) : purposes.map((p, i: number) => {
                  const isSelected = selectedPurposeIds.includes(p.id);
                  return (
                    <tr key={p.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPurposeIds(prev => [...prev, p.id]);
                            else setSelectedPurposeIds(prev => prev.filter(id => id !== p.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{p.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.description || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEditPurpose(p)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 mr-2">
                          <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeletePurpose(p.id)} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 border border-rose-100">
                          <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Drawer Transaksi Wakaf (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={drawerTrxOpen}
        onClose={() => setDrawerTrxOpen(false)}
        title={drawerTrxType === "in" ? "Terima Wakaf Baru" : "Catat Penyaluran Wakaf"}
        subtitle="Lengkapi parameter transaksi keuangan wakaf"
        width="max-w-md"
      >
        <form onSubmit={handleSubmitTrx} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal *</label>
            <input
              type="date"
              required
              value={trxForm.date}
              onChange={e => setTrxForm({ ...trxForm, date: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {drawerTrxType === "in" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Donatur *</label>
              <select
                required
                value={trxForm.donorId}
                onChange={e => setTrxForm({ ...trxForm, donorId: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Pilih Donatur --</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Program Tujuan *</label>
            <select
              required
              value={trxForm.purposeId}
              onChange={e => setTrxForm({ ...trxForm, purposeId: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Program --</option>
              {purposes.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sumber / Tujuan Kas *</label>
            <select
              required
              value={trxForm.cashAccountId}
              onChange={e => setTrxForm({ ...trxForm, cashAccountId: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Akun Kas --</option>
              {cashAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp) *</label>
            <input
              type="number"
              required
              min={1}
              value={trxForm.amount}
              onChange={e => setTrxForm({ ...trxForm, amount: e.target.value })}
              placeholder="0"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label>
            <input
              type="text"
              value={trxForm.description}
              onChange={e => setTrxForm({ ...trxForm, description: e.target.value })}
              placeholder="Catatan opsional..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDrawerTrxOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={trxLoading}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors shadow-sm ${
                drawerTrxType === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {trxLoading ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </LeftDrawer>

      {/* Drawer Donatur (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={drawerDonorOpen}
        onClose={() => setDrawerDonorOpen(false)}
        title={editingDonor ? "Edit Donatur" : "Tambah Donatur Baru"}
        subtitle="Kelola identitas donatur wakaf"
        width="max-w-md"
      >
        <form onSubmit={handleSubmitDonor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={donorForm.name}
              onChange={e => setDonorForm({ ...donorForm, name: e.target.value })}
              placeholder="Nama donatur..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">No. WhatsApp / HP</label>
            <input
              type="text"
              value={donorForm.phone}
              onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })}
              placeholder="08..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat</label>
            <textarea
              value={donorForm.address}
              onChange={e => setDonorForm({ ...donorForm, address: e.target.value })}
              placeholder="Alamat domisili..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDrawerDonorOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={donorLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {donorLoading ? "Menyimpan..." : "Simpan Donatur"}
            </button>
          </div>
        </form>
      </LeftDrawer>

      {/* Drawer Program / Tujuan (Muncul dari kiri) */}
      <LeftDrawer
        isOpen={drawerPurposeOpen}
        onClose={() => setDrawerPurposeOpen(false)}
        title={editingPurpose ? "Edit Program Wakaf" : "Tambah Program Wakaf Baru"}
        subtitle="Kelola pos penyaluran dan tujuan dana wakaf"
        width="max-w-md"
      >
        <form onSubmit={handleSubmitPurpose} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Program / Tujuan *</label>
            <input
              type="text"
              required
              value={purposeForm.name}
              onChange={e => setPurposeForm({ ...purposeForm, name: e.target.value })}
              placeholder="Misal: Pembangunan Asrama Santri"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
            <textarea
              value={purposeForm.description}
              onChange={e => setPurposeForm({ ...purposeForm, description: e.target.value })}
              placeholder="Rincian program..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDrawerPurposeOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={purposeLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {purposeLoading ? "Menyimpan..." : "Simpan Program"}
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
