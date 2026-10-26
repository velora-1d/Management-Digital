"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Tag, ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { ExportButtons } from "@/lib/export-utils";
import Card from "@/components/ui/Card";

interface TransactionCategory {
  id: number;
  name: string;
  type: "in" | "out";
  description?: string;
}

export default function TransactionCategoriesPage() {
  const queryClient = useQueryClient();
  const [inPage, setInPage] = useState(1);
  const [outPage, setOutPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(5);
  const [selectedInIds, setSelectedInIds] = useState<number[]>([]);
  const [selectedOutIds, setSelectedOutIds] = useState<number[]>([]);

  const { data: inResult, isLoading: inLoading } = useQuery({
    queryKey: ["transaction-categories", "in", inPage, search],
    queryFn: async () => {
      const res = await fetch(`/api/transaction-categories?type=in&page=${inPage}&limit=${limit}&q=${search}`);
      return res.json();
    },
  });

  const { data: outResult, isLoading: outLoading } = useQuery({
    queryKey: ["transaction-categories", "out", outPage, search],
    queryFn: async () => {
      const res = await fetch(`/api/transaction-categories?type=out&page=${outPage}&limit=${limit}&q=${search}`);
      return res.json();
    },
  });

  const inCats = inResult?.data || [];
  const inPagination = inResult?.pagination || { total: 0, totalPages: 1 };
  const outCats = outResult?.data || [];
  const outPagination = outResult?.pagination || { total: 0, totalPages: 1 };

  const refreshData = (type?: string) => {
    if (type) {
      queryClient.invalidateQueries({ queryKey: ["transaction-categories", type] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["transaction-categories"] });
    }
  };

  const handleAdd = () => {
    Swal.fire({
      title: "Tambah Kategori",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Kategori</label>
          <input type="text" id="swal-cat-name" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Tipe</label>
            <select id="swal-cat-type" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="in">Pemasukan (In)</option>
              <option value="out">Pengeluaran (Out)</option>
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Keterangan</label>
          <textarea id="swal-cat-desc" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;"></textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => ({
        name: (document.getElementById("swal-cat-name") as HTMLInputElement).value,
        type: (document.getElementById("swal-cat-type") as HTMLSelectElement).value,
        description: (document.getElementById("swal-cat-desc") as HTMLTextAreaElement).value
      })
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/transaction-categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Gagal menghubungi server");
          }
          const json = await res.json();
          if (json.success) { 
            Swal.fire("Berhasil", "Kategori ditambahkan", "success"); 
            refreshData(r.value.type); 
          }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch (error: unknown) { 
          const msg = error instanceof Error ? error.message : "Server error";
          Swal.fire("Error", msg, "error"); 
        }
      }
    });
  };

  const handleEditCat = (cat: TransactionCategory) => {
    Swal.fire({
      title: "Edit Kategori",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Kategori</label>
          <input type="text" id="swal-cat-name" class="swal2-input" value="${cat.name}" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Tipe</label>
            <select id="swal-cat-type" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="in" ${cat.type === 'in' ? 'selected' : ''}>Pemasukan (In)</option>
              <option value="out" ${cat.type === 'out' ? 'selected' : ''}>Pengeluaran (Out)</option>
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Keterangan</label>
          <textarea id="swal-cat-desc" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;">${cat.description || ''}</textarea></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      preConfirm: () => ({
        name: (document.getElementById("swal-cat-name") as HTMLInputElement).value,
        type: (document.getElementById("swal-cat-type") as HTMLSelectElement).value,
        description: (document.getElementById("swal-cat-desc") as HTMLTextAreaElement).value
      })
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/transaction-categories?id=${cat.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Gagal menghubungi server");
          }
          const json = await res.json();
          if (json.success) { 
            Swal.fire("Berhasil", "Kategori diperbarui", "success"); 
            refreshData(); 
          }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch (error: unknown) { 
          const msg = error instanceof Error ? error.message : "Server error";
          Swal.fire("Error", msg, "error"); 
        }
      }
    });
  };

  const handleDeleteCat = async (id: number, type: string) => {
    Swal.fire({
      title: "Hapus Kategori?",
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus"
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/transaction-categories?id=${id}`, { method: "DELETE" });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Gagal menghubungi server");
          }
          const json = await res.json();
          if (json.success) { 
            Swal.fire("Berhasil", "Dihapus", "success"); 
            refreshData(type); 
          }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch (error: unknown) { 
          const msg = error instanceof Error ? error.message : "Server error";
          Swal.fire("Error", msg, "error"); 
        }
      }
    });
  };

  const handleBulkDeleteIn = async () => {
    if (selectedInIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Kategori Pemasukan Terpilih?",
      text: `Anda akan menghapus ${selectedInIds.length} kategori pemasukan terpilih.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedInIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedInIds.map(id => fetch(`/api/transaction-categories?id=${id}`, { method: "DELETE" })));
      Swal.fire("Berhasil", `${selectedInIds.length} kategori berhasil dihapus`, "success");
      setSelectedInIds([]);
      refreshData("in");
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa kategori", "error");
    }
  };

  const handleBulkDeleteOut = async () => {
    if (selectedOutIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Kategori Pengeluaran Terpilih?",
      text: `Anda akan menghapus ${selectedOutIds.length} kategori pengeluaran terpilih.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedOutIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedOutIds.map(id => fetch(`/api/transaction-categories?id=${id}`, { method: "DELETE" })));
      Swal.fire("Berhasil", `${selectedOutIds.length} kategori berhasil dihapus`, "success");
      setSelectedOutIds([]);
      refreshData("out");
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa kategori", "error");
    }
  };

  const allInCats = inResult?.data || [];
  const allOutCats = outResult?.data || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Kategori Keuangan"
        subtitle="Kelola kategori pemasukan & pengeluaran madrasah."
        icon={<Tag className="w-5 h-5 text-blue-600" />}
        actions={
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setInPage(1);
                    setOutPage(1);
                  }}
                  className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full sm:w-64 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <ExportButtons 
                  options={{
                    title: "Kategori Keuangan",
                    filename: `kategori_keuangan_${new Date().toISOString().split("T")[0]}`,
                    columns: [
                      { header: "Tipe", key: "type", width: 15, format: (v: string) => v === 'in' ? 'Pemasukan' : 'Pengeluaran' },
                      { header: "Nama Kategori", key: "name", width: 35 },
                      { header: "Keterangan", key: "description", width: 45 },
                    ],
                    data: [...allInCats, ...allOutCats]
                  }}
                />
                <button 
                  onClick={handleAdd} 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Tambah
                </button>
              </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Pemasukan */}
        <Card>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
               <h3 className="font-heading font-bold text-slate-800">Pemasukan</h3>
               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">{inPagination.total}</span>
            </div>
            {selectedInIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDeleteIn}
                  className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg inline-flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus ({selectedInIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInIds([])}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", borderBottom: "1.5px solid #e2e8f0", width: 44 }}>
                    <input
                      type="checkbox"
                      checked={inCats.length > 0 && selectedInIds.length === inCats.length}
                      onChange={(e) => setSelectedInIds(e.target.checked ? inCats.map((c: TransactionCategory) => c.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua kategori pemasukan"
                    />
                  </th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Keterangan</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inLoading ? (
                  <tr><td colSpan={5} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>
                    <div className="flex flex-col items-center gap-2">
                       <svg className="animate-spin w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                       <span>Memuat...</span>
                    </div>
                  </td></tr>
                ) : inCats.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>{search ? "Hasil tidak ditemukan." : "Belum ada kategori pemasukan."}</td></tr>
                ) : (
                  <>
                   {inCats.map((c: TransactionCategory, i: number) => {
                    const isSelected = selectedInIds.includes(c.id);
                    return (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedInIds(prev => [...prev, c.id]);
                            else setSelectedInIds(prev => prev.filter(id => id !== c.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih ${c.name}`}
                        />
                      </td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>{(inPage - 1) * limit + i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>{c.description || "-"}</td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button onClick={() => handleEditCat(c)} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteCat(c.id, 'in')} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                   );})}
                  {Array.from({ length: Math.max(0, limit - inCats.length) }).map((_, i) => (
                    <tr key={`empty-in-${i}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td colSpan={5} style={{ padding: "0.875rem 1.5rem" }}>&nbsp;</td>
                    </tr>
                  ))}
                 </>
                )}
              </tbody>
            </table>
          </div>
          {inCats.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                page={inPage}
                totalPages={inPagination.totalPages}
                total={inPagination.total}
                onPageChange={(p) => setInPage(p)}
                limit={limit}
              />
            </div>
          )}
        </Card>

        {/* Card Pengeluaran */}
        <Card>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ArrowDownCircle className="w-5 h-5 text-rose-600" />
               <h3 className="font-heading font-bold text-slate-800">Pengeluaran</h3>
               <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-full">{outPagination.total}</span>
            </div>
            {selectedOutIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDeleteOut}
                  className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg inline-flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus ({selectedOutIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOutIds([])}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", borderBottom: "1.5px solid #e2e8f0", width: 44 }}>
                    <input
                      type="checkbox"
                      checked={outCats.length > 0 && selectedOutIds.length === outCats.length}
                      onChange={(e) => setSelectedOutIds(e.target.checked ? outCats.map((c: TransactionCategory) => c.id) : [])}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      aria-label="Pilih semua kategori pengeluaran"
                    />
                  </th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Keterangan</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {outLoading ? (
                  <tr><td colSpan={5} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>
                    <div className="flex flex-col items-center gap-2">
                       <svg className="animate-spin w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                       <span>Memuat...</span>
                    </div>
                  </td></tr>
                ) : outCats.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>{search ? "Hasil tidak ditemukan." : "Belum ada kategori pengeluaran."}</td></tr>
                ) : (
                  <>
                   {outCats.map((c: TransactionCategory, i: number) => {
                    const isSelected = selectedOutIds.includes(c.id);
                    return (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedOutIds(prev => [...prev, c.id]);
                            else setSelectedOutIds(prev => prev.filter(id => id !== c.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih ${c.name}`}
                        />
                      </td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{(outPage - 1) * limit + i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>{c.description || "-"}</td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button onClick={() => handleEditCat(c)} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.5rem", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteCat(c.id, 'out')} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                   );})}
                  {Array.from({ length: Math.max(0, limit - outCats.length) }).map((_, i) => (
                    <tr key={`empty-out-${i}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td colSpan={5} style={{ padding: "0.875rem 1.5rem" }}>&nbsp;</td>
                    </tr>
                  ))}
                 </>
                )}
              </tbody>
            </table>
          </div>
          {outCats.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Pagination
                page={outPage}
                totalPages={outPagination.totalPages}
                total={outPagination.total}
                onPageChange={(p) => setOutPage(p)}
                limit={limit}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
