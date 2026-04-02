"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import { ExportButtons, fmtRupiah } from "@/lib/export-utils";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Package } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

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

  const { data: queryResult, isLoading } = useQuery({
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

  const data: any[] = queryResult?.data || [];
  const totalPages = queryResult?.pagination?.totalPages || 1;
  const total = queryResult?.pagination?.total || 0;

  const refreshInventory = () => queryClient.invalidateQueries({ queryKey: ["inventory"] });

  const totalValue = data.reduce(
    (acc, val) => acc + (val.quantity || 0) * (val.acquisitionCost || 0),
    0
  );

  const handleAdd = () => {
    Swal.fire({
      title: "Tambah Aset",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <div><label style="font-size:0.75rem;font-weight:600;">Nama Barang</label>
          <input id="swal-inv-name" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Kategori</label>
          <input id="swal-inv-cat" class="swal2-input" placeholder="Mebel, Elektronik..." style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Jumlah</label>
          <input id="swal-inv-qty" type="number" class="swal2-input" value="1" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Kondisi</label>
          <select id="swal-inv-cond" class="swal2-select" style="margin:0;height:2.5rem;font-size:0.875rem;width:100%;padding:0 0.5rem;">
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select></div>
          
          <div><label style="font-size:0.75rem;font-weight:600;">Lokasi</label>
          <input id="swal-inv-loc" class="swal2-input" placeholder="Ruang Kelas 1" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>

          <div><label style="font-size:0.75rem;font-weight:600;">Harga Perolehan (Per item)</label>
          <input id="swal-inv-cost" type="number" class="swal2-input" value="0" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      preConfirm: () => {
        return {
          name: (document.getElementById("swal-inv-name") as HTMLInputElement).value,
          category: (document.getElementById("swal-inv-cat") as HTMLInputElement).value,
          quantity: parseInt((document.getElementById("swal-inv-qty") as HTMLInputElement).value) || 1,
          condition: (document.getElementById("swal-inv-cond") as HTMLSelectElement).value,
          location: (document.getElementById("swal-inv-loc") as HTMLInputElement).value,
          acquisitionCost: parseInt((document.getElementById("swal-inv-cost") as HTMLInputElement).value) || 0,
        };
      },
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch("/api/inventory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r.value),
          });
          const data = await res.json();
          if (res.ok) {
            Swal.fire("Berhasil", "Aset ditambahkan.", "success");
            refreshInventory();
          } else {
            Swal.fire("Gagal", data.error || "Gagal menyimpan aset", "error");
          }
        } catch (e) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const handleEdit = async (id: number) => {
    Swal.fire({ title: "Memuat...", didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch(`/api/inventory/${id}`);
      const item = await res.json();
      Swal.close();

      if (item.error) {
        Swal.fire("Error", item.error, "error");
        return;
      }

      Swal.fire({
        title: "Edit Aset",
        html: `
          <div style="text-align:left;display:grid;gap:0.75rem;">
            <div><label style="font-size:0.75rem;font-weight:600;">Nama Barang</label>
            <input id="swal-inv-name" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
            
            <div><label style="font-size:0.75rem;font-weight:600;">Kategori</label>
            <input id="swal-inv-cat" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
            
            <div><label style="font-size:0.75rem;font-weight:600;">Jumlah</label>
            <input id="swal-inv-qty" type="number" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
            
            <div><label style="font-size:0.75rem;font-weight:600;">Kondisi</label>
            <select id="swal-inv-cond" class="swal2-select" style="margin:0;height:2.5rem;font-size:0.875rem;width:100%;padding:0 0.5rem;">
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select></div>
            
            <div><label style="font-size:0.75rem;font-weight:600;">Lokasi</label>
            <input id="swal-inv-loc" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>

            <div><label style="font-size:0.75rem;font-weight:600;">Harga Perolehan</label>
            <input id="swal-inv-cost" type="number" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div>
          </div>
        `,
        didOpen: () => {
          (document.getElementById("swal-inv-name") as HTMLInputElement).value = item.name || "";
          (document.getElementById("swal-inv-cat") as HTMLInputElement).value = item.category || "";
          (document.getElementById("swal-inv-qty") as HTMLInputElement).value = String(item.quantity || 1);
          (document.getElementById("swal-inv-cond") as HTMLSelectElement).value = item.condition || "Baik";
          (document.getElementById("swal-inv-loc") as HTMLInputElement).value = item.location || "";
          (document.getElementById("swal-inv-cost") as HTMLInputElement).value = String(item.acquisitionCost || 0);
        },
        showCancelButton: true,
        confirmButtonText: "Simpan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3b82f6",
        preConfirm: () => {
          return {
            name: (document.getElementById("swal-inv-name") as HTMLInputElement).value,
            category: (document.getElementById("swal-inv-cat") as HTMLInputElement).value,
            quantity: parseInt((document.getElementById("swal-inv-qty") as HTMLInputElement).value) || 1,
            condition: (document.getElementById("swal-inv-cond") as HTMLSelectElement).value,
            location: (document.getElementById("swal-inv-loc") as HTMLInputElement).value,
            acquisitionCost: parseInt((document.getElementById("swal-inv-cost") as HTMLInputElement).value) || 0,
          };
        },
      }).then(async (r) => {
        if (r.isConfirmed) {
          try {
            const resUpdate = await fetch(`/api/inventory/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(r.value),
            });
            const dataUpdate = await resUpdate.json();
            if (resUpdate.ok) {
              Swal.fire("Berhasil", "Aset diperbarui.", "success");
              refreshInventory();
            } else {
              Swal.fire("Gagal", dataUpdate.error || "Gagal update aset", "error");
            }
          } catch (e) {
            Swal.fire("Error", "Gagal menghubungi server", "error");
          }
        }
      });
    } catch (e) {
      Swal.fire("Error", "Gagal memuat detail aset", "error");
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
        } catch (error) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris Madrasah"
        subtitle="Pencatatan & Pengelolaan Aset Barang Madrasah"
        icon={<Package className="w-5 h-5 text-indigo-600" />}
      />
      {/* KPI Total Nilai */}
      <Card compact>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Total Nilai Aset</span>
          <span className="text-xl font-extrabold text-indigo-700">Rp {totalValue.toLocaleString("id-ID")}</span>
        </div>
      </Card>

      {/* Tabel Inventaris */}
      <Card
        title="Daftar Aset"
        icon={<Package className="w-5 h-5 text-indigo-600" />}
        actions={
          <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
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
              data: data.map((item: any, i: number) => ({
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
                <tr><td colSpan={6} style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "4rem 1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Aset Inventaris Kosong.</td></tr>
              ) : (
                data.map((item, i) => {
                  let badge = null;
                  if (item.condition === "Baik") {
                    badge = <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-100">Baik</span>;
                  } else if (item.condition === "Rusak Ringan") {
                    badge = <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-100">Rusak Ringan</span>;
                  } else {
                    badge = <span className="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-100">Rusak Berat</span>;
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600, verticalAlign: "middle" }}>{(page - 1) * limit + i + 1}</td>
                      <td style={{ padding: "1.25rem 1.5rem", verticalAlign: "middle" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>{item.name}</p>
                        {item.location && <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>📍 {item.location}</p>}
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", verticalAlign: "middle" }}>
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "0.375rem 0.875rem", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 600 }}>{item.category || "-"}</span>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center", fontWeight: 700, fontSize: "1rem", color: "#334155", verticalAlign: "middle" }}>{item.quantity || 0}</td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "center", verticalAlign: "middle" }}>{badge}</td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "right", verticalAlign: "middle", position: "relative" }}>
                        <button 
                          onClick={(ev) => { 
                            ev.stopPropagation(); 
                            (ev.nativeEvent as any).stopImmediatePropagation();
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
                            <button onClick={() => { setOpenActionId(null); handleEdit(item.id); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 600, color: "#3b82f6", background: "transparent", border: "none", cursor: "pointer", borderRadius: "0.5rem", textAlign: "left" }} className="hover:bg-blue-50">
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
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
      </Card>
    </div>
  );
}
