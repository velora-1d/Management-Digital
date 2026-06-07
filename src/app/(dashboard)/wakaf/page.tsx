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
import { Gift, ArrowUpRight, ArrowDownLeft } from "lucide-react";

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
    let donorOptions = '<option value="">-- Pilih Donatur --</option>';
    donors.forEach(d => { donorOptions += `<option value="${d.id}">${d.name}</option>`; });
    
    let purposeOptions = '<option value="">-- Pilih Program --</option>';
    purposes.forEach(p => { purposeOptions += `<option value="${p.id}">${p.name}</option>`; });

    let accountOptions = '<option value="">-- Pilih Akun Kas --</option>';
    cashAccounts.forEach(a => { accountOptions += `<option value="${a.id}">${a.name}</option>`; });

    Swal.fire({
      title: type === "in" ? "Terima Wakaf" : "Catat Penyaluran Wakaf",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Tanggal</label>
            <input type="date" id="swal-w-date" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%" value="${new Date().toISOString().split('T')[0]}">
          </div>
          ${type === "in" ? `
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Donatur</label>
            <select id="swal-w-donor" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">${donorOptions}</select>
          </div>
          ` : ""}
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Program Tujuan</label>
            <select id="swal-w-purpose" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">${purposeOptions}</select>
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Sumber / Tujuan Kas</label>
            <select id="swal-w-account" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">${accountOptions}</select>
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Nominal (Rp)</label>
            <input type="number" id="swal-w-amount" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%">
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Keterangan</label>
            <input type="text" id="swal-w-desc" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%" placeholder="Opsional...">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan Transaksi",
      confirmButtonColor: type === "in" ? "#10b981" : "#e11d48",
      preConfirm: () => {
        return {
          type,
          date: (document.getElementById("swal-w-date") as HTMLInputElement).value,
          donorId: type === "in" ? Number((document.getElementById("swal-w-donor") as HTMLSelectElement).value) : null,
          purposeId: Number((document.getElementById("swal-w-purpose") as HTMLSelectElement).value),
          cashAccountId: Number((document.getElementById("swal-w-account") as HTMLSelectElement).value),
          amount: Number((document.getElementById("swal-w-amount") as HTMLInputElement).value),
          description: (document.getElementById("swal-w-desc") as HTMLInputElement).value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        const payload = r.value;
        if ((type === "in" && !payload.donorId) || !payload.amount || !payload.purposeId || !payload.cashAccountId) {
          return Swal.fire("Error", "Mohon lengkapi semua kolom wajib!", "error");
        }
        Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
          const res = await fetch("/api/wakaf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          Swal.close();
          if (res.ok && json.success) {
            Swal.fire("Berhasil", json.message, "success");
            refreshWakafData();
          } else Swal.fire("Gagal", json.error || "Gagal menyimpan", "error");
        } catch { Swal.fire("Error", "Terjadi kesalahan server", "error"); }
      }
    });
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

  // Donatur & Purpose Actions... (Tetap sama seperti sebelumnya)
  const handleAddDonor = () => {
    Swal.fire({
      title: "Tambah Donatur",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Lengkap</label>
          <input type="text" id="swal-d-name" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">No HP</label>
          <input type="text" id="swal-d-phone" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Alamat</label>
          <textarea id="swal-d-address" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;"></textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => ({
        name: (document.getElementById("swal-d-name") as HTMLInputElement).value,
        phone: (document.getElementById("swal-d-phone") as HTMLInputElement).value,
        address: (document.getElementById("swal-d-address") as HTMLTextAreaElement).value
      })
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/wakaf/donors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Donatur ditambahkan", "success"); refreshDonors(); }
          else Swal.fire("Gagal", json.error, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleAddPurpose = () => {
    Swal.fire({
      title: "Tambah Tujuan Wakaf",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Program/Tujuan</label>
          <input type="text" id="swal-p-name" class="swal2-input" placeholder="Misal: Pembangunan Masjid" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Deskripsi</label>
          <textarea id="swal-p-desc" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;"></textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => ({
        name: (document.getElementById("swal-p-name") as HTMLInputElement).value,
        description: (document.getElementById("swal-p-desc") as HTMLTextAreaElement).value
      })
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/wakaf/purposes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Tujuan ditambahkan", "success"); refreshPurposes(); }
          else Swal.fire("Gagal", json.error, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
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

  const handleEditPurpose = (p: WakafPurpose) => {
    Swal.fire({
      title: "Edit Program",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Nama Program</label>
            <input type="text" id="swal-p-name" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%">
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Deskripsi</label>
            <textarea id="swal-p-desc" class="swal2-input" style="margin:0;height:4rem;padding:0.5rem;font-size:0.875rem;width:100%;resize:none;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      preConfirm: () => {
        return {
          id: p.id,
          name: (document.getElementById("swal-p-name") as HTMLInputElement).value,
          description: (document.getElementById("swal-p-desc") as HTMLTextAreaElement).value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/wakaf/purposes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r.value)
          });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Program diperbarui", "success"); refreshPurposes(); }
          else Swal.fire("Gagal", json.error || json.message, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleEditDonor = (d: WakafDonor) => {
    Swal.fire({
      title: "Edit Donatur",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Nama Lengkap</label>
            <input type="text" id="swal-d-name" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%">
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">No HP</label>
            <input type="text" id="swal-d-phone" class="swal2-input" style="margin:0;height:2.5rem;padding:0.5rem;font-size:0.875rem;width:100%">
          </div>
          <div>
            <label style="font-size:0.75rem;font-weight:600;">Alamat</label>
            <textarea id="swal-d-address" class="swal2-input" style="margin:0;height:4rem;padding:0.5rem;font-size:0.875rem;width:100%;resize:none;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      preConfirm: () => {
        return {
          id: d.id,
          name: (document.getElementById("swal-d-name") as HTMLInputElement).value,
          phone: (document.getElementById("swal-d-phone") as HTMLInputElement).value,
          address: (document.getElementById("swal-d-address") as HTMLTextAreaElement).value
        };
      }
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/wakaf/donors", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r.value)
          });
          const json = await res.json();
          if (res.ok && json.success) { Swal.fire("Berhasil", "Donatur diperbarui", "success"); refreshDonors(); }
          else Swal.fire("Gagal", json.error || json.message, "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Wakaf & Donasi"
        subtitle="Kelola penerimaan dan penyaluran dana wakaf madrasah."
        icon={<Gift />}
        gradient="from-emerald-600 via-teal-600 to-green-600"
      />

      <FilterBar 
        visibleFilters={["academicYear", "semester", "month", "type"]}
        customTypeOptions={[
          { label: "Masuk (Penerimaan)", value: "in" },
          { label: "Keluar (Penyaluran)", value: "out" },
        ]}
      />

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm">
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
                    { header: "Tanggal", key: "_date", width: 15 },
                    { header: "Tipe", key: "type", width: 10 },
                    { header: "Keterangan", key: "donor_name", width: 25 },
                    { header: "Program", key: "purpose_name", width: 25 },
                    { header: "Nominal", key: "amount", width: 20, align: "right", format: (v: unknown) => fmtRupiah(Number(v)) },
                    { header: "Status", key: "_status", width: 10, align: "center" },
                  ],
                  data: data.map((t) => ({
                    ...t,
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
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 border-b border-slate-100">Belum ada transaksi ditemukan</td>
                  </tr>
                )}
                {data.slice((page - 1) * limit, page * limit).map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" style={{ opacity: t.status === 'void' ? 0.5 : 1}}>
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
                      ) : <span className="text-[10px] font-bold text-slate-300">VOID</span>}

                      {openActionId === t.id && (
                        <div className="absolute top-10 right-10 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1 min-w-[120px]">
                          <button onClick={() => handleDeleteWakaf(t.id)} className="w-full text-left px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2">
                            Void Transaksi
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 bg-slate-50/30 border-t border-slate-100">
            <Pagination page={page} totalPages={Math.ceil(data.length / limit) || 1} total={data.length} limit={limit} onPageChange={(p) => setPage(p)} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
          </div>
        </Card>
      )}

      {/* Tab lain (Donatur & Tujuan) tetap sama dengan penyesuaian gaya jika perlu */}
      {activeTab === "donatur" && (
        <Card className="animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Basis Data Donatur</h4>
            </div>
            <button onClick={handleAddDonor} className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-600 shadow-sm">+ Donatur Baru</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-slate-200">Nama Lengkap</th>
                   <th className="px-6 py-4 border-b border-slate-200">No HP</th>
                  <th className="px-6 py-4 border-b border-slate-200">Alamat</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(d => (
                   <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{d.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{d.phone || "-"}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{d.address || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleEditDonor(d)} className="p-1.5 bg-sky-50 text-sky-500 rounded-lg hover:bg-sky-100 border border-sky-100 mr-2">
                        <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteDonor(d.id)} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 border border-rose-100">
                        <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "tujuan" && (
        <Card className="animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="font-heading font-bold text-[15px] text-slate-800 m-0">Program & Penyaluran Wakaf</h4>
            </div>
            <button onClick={handleAddPurpose} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 shadow-sm">+ Tambah Program</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4 border-b border-slate-200">Nama Program</th>
                  <th className="px-6 py-4 border-b border-slate-200">Deskripsi</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {purposes.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{p.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{p.description || "-"}</td>
                     <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      <button onClick={() => handleEditPurpose(p)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 border border-amber-100">
                        <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeletePurpose(p.id)} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 border border-rose-100">
                        <svg style={{width:14, height:14}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
