"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import LeftDrawer from "@/components/ui/LeftDrawer";
import { Package, CheckCircle2, Trash2, Plus, Save, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface InventoryItem {
  id: number;
  name: string;
  category?: string | null;
  quantity: number;
  condition: "Baik" | "Rusak Ringan" | "Rusak Berat";
  location?: string | null;
  acquisitionCost: number;
}

interface InventoryQueryResult {
  data?: InventoryItem[];
  pagination?: {
    totalPages: number;
    total: number;
  };
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  const { data: queryResult, isLoading } = useQuery<InventoryQueryResult>({
    queryKey: ["inventory", search, conditionFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("q", search);
      if (conditionFilter) params.set("condition", conditionFilter);
      const res = await fetch(`/api/inventory?${params}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const data: InventoryItem[] = queryResult?.data || [];
  const totalPages = queryResult?.pagination?.totalPages || 1;
  const total = queryResult?.pagination?.total || 0;

  const refreshInventory = () => queryClient.invalidateQueries({ queryKey: ["inventory"] });

  const totalValue = data.reduce(
    (acc, val) => acc + (val.quantity || 0) * (val.acquisitionCost || 0),
    0
  );

  // LeftDrawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 1,
    condition: "Baik" as "Baik" | "Rusak Ringan" | "Rusak Berat",
    location: "",
    acquisitionCost: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  const handleOpenAdd = () => {
    setDrawerMode("add");
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      quantity: 1,
      condition: "Baik",
      location: "",
      acquisitionCost: 0,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = async (id: number) => {
    setDrawerMode("edit");
    setEditingId(id);
    setIsDrawerOpen(true);
    setFormLoading(true);
    try {
      const res = await fetch(`/api/inventory/${id}`);
      const item = await res.json();
      if (item && !item.error) {
        setFormData({
          name: item.name || "",
          category: item.category || "",
          quantity: item.quantity || 1,
          condition: item.condition || "Baik",
          location: item.location || "",
          acquisitionCost: item.acquisitionCost || 0,
        });
      }
    } catch {
      Swal.fire("Error", "Gagal memuat detail aset", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire("Perhatian", "Nama barang wajib diisi", "warning");
      return;
    }
    setFormLoading(true);
    try {
      const url = drawerMode === "edit" ? `/api/inventory/${editingId}` : "/api/inventory";
      const method = drawerMode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: "Berhasil",
          text: drawerMode === "edit" ? "Aset berhasil diperbarui" : "Aset berhasil ditambahkan",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setIsDrawerOpen(false);
        refreshInventory();
      } else {
        Swal.fire("Gagal", data.error || "Gagal menyimpan aset", "error");
      }
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Write-off Aset?",
      text: "Aset ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (res.ok && json.success) {
            Swal.fire("Terhapus", "Data aset berhasil dihapus.", "success");
            refreshInventory();
          } else {
            Swal.fire("Gagal", json.error || "Error", "error");
          }
        } catch {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Aset Terpilih?",
      text: `Anda akan menghapus ${selectedIds.length} data aset inventaris terpilih.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Ya, Hapus (${selectedIds.length})`,
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/inventory/${id}`, { method: "DELETE" })));
      Swal.fire("Terhapus", `${selectedIds.length} data aset berhasil dihapus.`, "success");
      setSelectedIds([]);
      refreshInventory();
    } catch {
      Swal.fire("Error", "Gagal menghapus beberapa aset", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris Madrasah"
        subtitle="Pencatatan & Pengelolaan Aset Barang Madrasah"
        icon={<Package className="w-5 h-5 text-blue-600" />}
      />
      {/* KPI Total Nilai */}
      <Card compact>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Total Nilai Aset</span>
          <span className="text-xl font-extrabold text-blue-700">Rp {totalValue.toLocaleString("id-ID")}</span>
        </div>
      </Card>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in mb-4">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{selectedIds.length} aset dipilih</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBulkDelete}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
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

      {/* Tabel Inventaris */}
      <Card
        title="Daftar Aset"
        icon={<Package className="w-5 h-5 text-blue-600" />}
        actions={
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs">
            <Plus className="w-4 h-4" />
            Tambah Aset
          </button>
        }
        noPadding
      >

        {/* Filter */}
        <div style={{ padding: "1rem 1.5rem", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <input type="text" placeholder="Cari nama, kategori, lokasi..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 200, padding: "0.625rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.75rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
          <select value={conditionFilter} onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }} style={{ padding: "0.625rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.75rem", fontSize: "0.8125rem", outline: "none", background: "#fff" }} className="focus:border-blue-500 transition-all min-w-[150px]">
            <option value="">Semua Kondisi</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>
        {data.length > 0 && (
          <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
            <ExportButtons options={{
              title: "Inventaris Madrasah",
              filename: `inventaris_${new Date().toISOString().split("T")[0]}`,
              columns: [
                { header: "No", key: "_no", width: 8, align: "center" },
                { header: "Nama Barang", key: "name", width: 30 },
                { header: "Kategori", key: "category", width: 18 },
                { header: "Jumlah", key: "quantity", width: 10, align: "center" },
                { header: "Kondisi", key: "condition", width: 15, align: "center" },
                { header: "Lokasi", key: "location", width: 20 },
                { header: "Harga Perolehan", key: "acquisitionCost", width: 20, align: "right", format: (v: number) => fmtRupiah(v) },
              ],
              data: data.map((item, i: number) => ({
                ...item,
                _no: (page - 1) * limit + i + 1,
                category: item.category || '-',
                location: item.location || '-',
              })),
            }} />
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 0.5rem", textAlign: "center", borderBottom: "1.5px solid #e2e8f0", width: 44 }}>
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? data.map(item => item.id) : [])}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label="Pilih semua aset"
                  />
                </th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama Barang</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kategori</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Jumlah</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kondisi</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Aset Inventaris Kosong.</td></tr>
              ) : (
                data.map((item, i) => {
                  let badge = "";
                  if (item.condition === "Baik") {
                    badge = '<span class="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-100">Baik</span>';
                  } else if (item.condition === "Rusak Ringan") {
                    badge = '<span class="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-100">Rusak Ringan</span>';
                  } else {
                    badge = '<span class="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-100">Rusak Berat</span>';
                  }
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 0.5rem", textAlign: "center", verticalAlign: "middle" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih aset ${item.name}`}
                        />
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600, verticalAlign: "middle" }}>{(page - 1) * limit + i + 1}</td>
                      <td style={{ padding: "1.25rem 1.5rem", verticalAlign: "middle" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>{item.name}</p>
                        {item.location && <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>{item.location}</p>}
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", verticalAlign: "middle" }}>
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "0.375rem 0.875rem", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 600 }}>{item.category || "-"}</span>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontWeight: 700, fontSize: "1rem", color: "#334155", verticalAlign: "middle" }}>{item.quantity || 0}</td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: badge }}></td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "right", verticalAlign: "middle", position: "relative" }}>
                        <button 
                          onClick={(ev) => { 
                            ev.stopPropagation(); 
                            ev.nativeEvent.stopImmediatePropagation();
                            setOpenActionId(openActionId === item.id ? null : item.id); 
                          }}
                          style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                          className="hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        >
                          <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {openActionId === item.id && (
                          <div 
                            style={{ position: "absolute", top: "100%", right: "1.5rem", zIndex: 50, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", minWidth: "140px", overflow: "hidden", display: "flex", flexDirection: "column", padding: "0.375rem" }}
                            onClick={(ev) => ev.stopPropagation()}
                          >
                            <div style={{ padding: "0.375rem 0.75rem", fontSize: "0.625rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", marginBottom: "0.25rem" }}>
                              Aksi Barang
                            </div>
                            <button onClick={() => { setOpenActionId(null); handleOpenEdit(item.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#3b82f6", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-blue-50">
                              Edit Barang
                            </button>
                            <button onClick={() => { setOpenActionId(null); handleDelete(item.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-rose-50">
                              Write-off
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
              {!isLoading && data.length > 0 && data.length < limit && (
                Array.from({ length: limit - data.length }).map((_, i) => (
                  <tr key={`filler-${i}`} style={{ height: "73px" }} className="bg-white border-b border-slate-100">
                    <td style={{ padding: "1.25rem 1.5rem" }}>&nbsp;</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>&nbsp;</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>&nbsp;</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>&nbsp;</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>&nbsp;</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>&nbsp;</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      </Card>

      {/* LeftDrawer Tambah / Edit Aset */}
      <LeftDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === "add" ? "Tambah Aset Inventaris" : "Edit Aset Inventaris"}
        subtitle="Formulir pendataan sarana & prasarana madrasah"
        width="max-w-lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Barang / Aset <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Proyektor Epson EB-X500 / Meja Guru"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Barang
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Mebel, Elektronik, dll"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jumlah Unit
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kondisi Barang
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as "Baik" | "Rusak Ringan" | "Rusak Berat" })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 cursor-pointer"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lokasi / Ruangan
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ruang Lab IPA / Kelas 7A"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Harga Perolehan (Per Unit)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
              <input
                type="number"
                value={formData.acquisitionCost || ""}
                onChange={(e) => setFormData({ ...formData, acquisitionCost: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{drawerMode === "add" ? "Simpan Aset" : "Perbarui Aset"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
