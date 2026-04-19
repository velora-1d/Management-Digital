"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Tag, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { ExportButtons } from "@/lib/export-utils";
import Card from "@/components/ui/Card";

export default function TransactionCategoriesPage() {
  const queryClient = useQueryClient();
  const [inPage, setInPage] = useState(1);
  const [outPage, setOutPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit] = useState(5);

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
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Kategori ditambahkan", "success"); 
            refreshData(r.value.type); 
          }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const handleEditCat = (cat: { id: number; name: string; type: string; description: string | null }) => {
    Swal.fire({
      title: "Edit Kategori",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Kategori</label>
          <input type="text" id="swal-cat-name" class="swal2-input" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;"></div>
          <div><label style="font-size:0.75rem;font-weight:600;">Tipe</label>
            <select id="swal-cat-type" class="swal2-select" style="margin:0;width:100%;height:2.5rem;padding:0.5rem;font-size:0.875rem;">
              <option value="in" ${cat.type === 'in' ? 'selected' : ''}>Pemasukan (In)</option>
              <option value="out" ${cat.type === 'out' ? 'selected' : ''}>Pengeluaran (Out)</option>
            </select>
          </div>
          <div><label style="font-size:0.75rem;font-weight:600;">Keterangan</label>
          <textarea id="swal-cat-desc" class="swal2-textarea" style="margin:0;width:100%;height:4rem;padding:0.5rem;font-size:0.875rem;"></textarea></div>
        </div>
      `,
      didOpen: () => {
        (document.getElementById("swal-cat-name") as HTMLInputElement).value = cat.name;
        (document.getElementById("swal-cat-desc") as HTMLTextAreaElement).value = cat.description || '';
      },
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
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Kategori diperbarui", "success"); 
            refreshData(); 
          }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
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
          const json = await res.json();
          if (res.ok && json.success) { 
            Swal.fire("Berhasil", "Dihapus", "success"); 
            refreshData(type); 
          }
          else Swal.fire("Gagal", json.message || "Gagal", "error");
        } catch { Swal.fire("Error", "Server error", "error"); }
      }
    });
  };

  const allInCats = inResult?.data || [];
  const allOutCats = outResult?.data || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Kategori Keuangan"
        subtitle="Kelola kategori pemasukan & pengeluaran madrasah."
        icon={
          <div className="p-2 bg-purple-500/20 rounded-lg">
             <Tag className="w-6 h-6 text-purple-200" />
          </div>
        }
        actions={
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setInPage(1);
                    setOutPage(1);
                  }}
                  className="pl-9 pr-4 py-2 text-xs bg-white/10 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-white/20 focus:bg-white/20 outline-none w-full sm:w-64 transition-all placeholder:text-white/40"
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
                  className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:bg-slate-50 active:scale-95 shadow-lg shadow-purple-900/20"
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
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
               <h3 className="font-heading font-bold text-white">Pemasukan</h3>
               <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full">{inPagination.total}</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Keterangan</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inLoading ? (
                  <tr><td colSpan={4} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>
                    <div className="flex flex-col items-center gap-2">
                       <svg className="animate-spin w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                       <span>Memuat...</span>
                    </div>
                  </td></tr>
                ) : inCats.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>{search ? "Hasil tidak ditemukan." : "Belum ada kategori pemasukan."}</td></tr>
                ) : (
                   inCats.map((c: { id: number; name: string; type: string; description: string | null }, i: number) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{(inPage - 1) * limit + i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>{c.description || "-"}</td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button onClick={() => handleEditCat(c)} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteCat(c.id, 'in')} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
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
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <ArrowDownCircle className="w-5 h-5 text-rose-400" />
               <h3 className="font-heading font-bold text-white">Pengeluaran</h3>
               <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full">{outPagination.total}</span>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Keterangan</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {outLoading ? (
                  <tr><td colSpan={4} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>
                    <div className="flex flex-col items-center gap-2">
                       <svg className="animate-spin w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                       <span>Memuat...</span>
                    </div>
                  </td></tr>
                ) : outCats.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>{search ? "Hasil tidak ditemukan." : "Belum ada kategori pengeluaran."}</td></tr>
                ) : (
                   outCats.map((c: { id: number; name: string; type: string; description: string | null }, i: number) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{(outPage - 1) * limit + i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>{c.description || "-"}</td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button onClick={() => handleEditCat(c)} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteCat(c.id, 'out')} style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
