"use client";

import React, { useState, useMemo } from "react";
import {
  School,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Layers,
  RotateCcw,
  Download,
  Lock,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

export interface SchoolLevelItem {
  id: number;
  code: string;
  name: string;
  orderNumber: number;
  isActive: boolean;
  hasPin?: boolean;
  class_rooms_count?: number;
  students_count?: number;
}

interface SchoolLevelsClientProps {
  initialLevels: SchoolLevelItem[];
}

export default function SchoolLevelsClient({ initialLevels }: SchoolLevelsClientProps) {
  const [dataList, setDataList] = useState<SchoolLevelItem[]>(initialLevels || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<SchoolLevelItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    orderNumber: 1,
    isActive: true,
    pin: "",
  });

  const refreshData = async () => {
    try {
      const res = await fetch("/api/school-levels?all=true");
      const json = await res.json();
      if (json.success && json.levels) {
        setDataList(json.levels);
      }
    } catch (err) {
      console.error("Gagal memuat ulang data jenjang:", err);
    }
  };

  // Filtered levels
  const filteredLevels = useMemo(() => {
    return dataList
      .filter((item) => {
        const matchSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
          selectedStatus === "all" ||
          (selectedStatus === "active" && item.isActive) ||
          (selectedStatus === "inactive" && !item.isActive);
        return matchSearch && matchStatus;
      })
      .sort((a, b) => a.orderNumber - b.orderNumber);
  }, [dataList, searchTerm, selectedStatus]);

  // Live Metrics
  const stats = useMemo(() => {
    const total = dataList.length;
    const active = dataList.filter((l) => l.isActive).length;
    const totalRombel = dataList.reduce((acc, l) => acc + (l.class_rooms_count || 0), 0);
    const totalStudents = dataList.reduce((acc, l) => acc + (l.students_count || 0), 0);
    return { total, active, totalRombel, totalStudents };
  }, [dataList]);

  const handleOpenCreateModal = () => {
    setEditingLevel(null);
    setFormData({
      code: "",
      name: "",
      orderNumber: dataList.length + 1,
      isActive: true,
      pin: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (level: SchoolLevelItem) => {
    setEditingLevel(level);
    setFormData({
      code: level.code,
      name: level.name,
      orderNumber: level.orderNumber,
      isActive: level.isActive,
      pin: "", // Jangan tampilkan PIN lama
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Periksa Formulir",
        text: "Harap lengkapi kode jenjang dan nama lengkap jenjang!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingLevel
        ? `/api/school-levels/${editingLevel.id}`
        : "/api/school-levels";
      const method = editingLevel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: data.message || (editingLevel ? "Jenjang diperbarui" : "Jenjang ditambahkan"),
          showConfirmButton: false,
          timer: 2000,
        });
        setIsModalOpen(false);
        setEditingLevel(null);
        await refreshData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: data.message || "Terjadi kesalahan saat menyimpan jenjang.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gangguan Sistem",
        text: "Gagal menghubungi server.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (level: SchoolLevelItem) => {
    try {
      const res = await fetch(`/api/school-levels/${level.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !level.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Status ${level.name} diubah menjadi ${!level.isActive ? "Aktif" : "Non-Aktif"}.`,
          showConfirmButton: false,
          timer: 2000,
        });
        await refreshData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengubah Status",
          text: data.message || "Gagal mengubah status jenjang.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gangguan Jaringan",
        text: "Tidak dapat mengubah status.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleDelete = async (level: SchoolLevelItem) => {
    const result = await Swal.fire({
      title: "Hapus Jenjang?",
      text: `Apakah Anda yakin ingin menghapus tingkatan ${level.name} (${level.code})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/school-levels/${level.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: data.message || "Jenjang berhasil dihapus.",
          showConfirmButton: false,
          timer: 2000,
        });
        await refreshData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus",
          text: data.message || "Jenjang tidak dapat dihapus.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gangguan Jaringan",
        text: "Terjadi gangguan saat menghapus.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleExportCSV = () => {
    const selectedData = filteredLevels.filter((l) => selectedIds.includes(l.id));
    const items = selectedData.length > 0 ? selectedData : filteredLevels;
    const csvRows = ["No,Kode Jenjang,Nama Jenjang,Urutan,Jumlah Rombel,Jumlah Siswa,Status"];
    items.forEach((l, idx) => {
      csvRows.push(
        `${idx + 1},"${l.code}","${l.name}",${l.orderNumber},${l.class_rooms_count || 0},${l.students_count || 0},"${l.isActive ? "Aktif" : "Non-Aktif"}"`
      );
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daftar-jenjang-sekolah-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `${items.length} data jenjang berhasil diekspor ke CSV!`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Clean Light Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 px-6 py-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 font-heading">
                Tingkatan & Jenjang Pendidikan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Konfigurasi jenjang satuan pendidikan (MI, MTs, MA, SMK, Pondok), rombongan belajar, dan penempatan siswa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jenjang</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Total Jenjang
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {stats.total} Satuan
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {stats.active} Aktif Operasional
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Total Rombel KBM
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {stats.totalRombel} Rombel
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ruang Belajar Terdaftar
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Total Peserta Didik
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {stats.totalStudents} Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Buku Induk Siswa Aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Status Kelembagaan
              </p>
              <h3 className="text-2xl font-bold font-mono text-slate-800 mt-1">
                Terpadu
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                Multi-Jenjang Aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <School className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama jenjang atau kode (MI, MTs, MA, SMK)..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter status jenjang"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 text-xs font-medium rounded-xl border border-slate-200 bg-white px-3.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer text-slate-700 transition-all"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Non-Aktif</option>
            </select>

            {(searchTerm || selectedStatus !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                }}
                className="h-9 px-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {selectedIds.length} dari {filteredLevels.length} jenjang dipilih
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-3 h-3 text-slate-500" />
              <span>Ekspor Terpilih</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              Batal Pilihan
            </button>
          </div>
        </div>
      )}

      {/* 4. Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredLevels.length > 0 &&
                      selectedIds.length === filteredLevels.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredLevels.map((l) => l.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    aria-label="Pilih semua jenjang"
                  />
                </th>
                <th className="px-3.5 py-3 font-medium text-center w-12">No.</th>
                <th className="px-3.5 py-3 font-medium text-center w-16">Urutan</th>
                <th className="px-3.5 py-3 font-medium">Kode Jenjang</th>
                <th className="px-3.5 py-3 font-medium">Nama Jenjang Pendidikan</th>
                <th className="px-3.5 py-3 font-medium text-center">Jumlah Rombel</th>
                <th className="px-3.5 py-3 font-medium text-center">Jumlah Siswa</th>
                <th className="px-3.5 py-3 font-medium text-center">Keamanan</th>
                <th className="px-3.5 py-3 font-medium text-center">Status</th>
                <th className="px-3.5 py-3 font-medium text-right pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredLevels.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-slate-400 font-mono text-xs"
                  >
                    Belum ada data jenjang sekolah. Klik &quot;Tambah Jenjang&quot; untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredLevels.map((lvl, idx) => {
                  const isSelected = selectedIds.includes(lvl.id);
                  return (
                    <tr
                      key={lvl.id}
                      className={`transition-colors duration-150 ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, lvl.id]);
                            } else {
                              setSelectedIds(selectedIds.filter((id) => id !== lvl.id));
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          aria-label={`Pilih ${lvl.name}`}
                        />
                      </td>

                      {/* No. */}
                      <td className="px-3.5 py-3 text-center font-mono text-xs text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Urutan */}
                      <td className="px-3.5 py-3 text-center font-mono text-xs text-slate-600 font-semibold">
                        {lvl.orderNumber}
                      </td>

                      {/* Kode Jenjang Chip */}
                      <td className="px-3.5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                          {lvl.code}
                        </span>
                      </td>

                      {/* Nama Jenjang */}
                      <td className="px-3.5 py-3 font-medium text-slate-800">
                        <div className="leading-tight">{lvl.name}</div>
                      </td>

                      {/* Jumlah Rombel */}
                      <td className="px-3.5 py-3 text-center font-mono text-xs text-slate-700 font-medium">
                        {lvl.class_rooms_count ?? 0} Rombel
                      </td>

                      {/* Jumlah Siswa */}
                      <td className="px-3.5 py-3 text-center font-mono text-xs font-bold text-blue-600">
                        {lvl.students_count ?? 0} Siswa
                      </td>

                      {/* Keamanan PIN */}
                      <td className="px-3.5 py-3 text-center">
                        {lvl.hasPin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" />
                            PIN
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            Bebas
                          </span>
                        )}
                      </td>

                      {/* Status Toggle Chip */}
                      <td className="px-3.5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(lvl)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer"
                          title="Klik untuk ubah status aktif"
                        >
                          {lvl.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" />
                              Non-Aktif
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="px-3.5 py-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(lvl)}
                            className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Ubah Jenjang"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(lvl)}
                            className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Hapus Jenjang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Dialog Form Tambah / Ubah Jenjang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingLevel(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingLevel ? "Ubah Tingkatan Jenjang" : "Tambah Tingkatan Jenjang"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingLevel
                    ? "Perbarui kode, nama, atau PIN pengaman jenjang."
                    : "Daftarkan jenjang pendidikan baru pada sistem yayasan."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Kode Jenjang */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1">
                  Kode Jenjang <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={15}
                  placeholder="Contoh: MI, MTs, MA, SMK, PONDOK"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs uppercase focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-slate-400 font-mono">
                  Singkatan unik pengenal tingkatan (maks. 15 karakter).
                </span>
              </div>

              {/* Nama Jenjang */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1">
                  Nama Lengkap Jenjang <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  placeholder="Contoh: Madrasah Tsanawiyah Terpadu"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Grid: Urutan & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderNumber: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1">
                    Status Operasional
                  </label>
                  <div className="flex items-center h-9">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* PIN Proteksi Opsional */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 font-semibold mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>PIN Proteksi (Opsional)</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="Kosongkan jika bebas beralih"
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value.replace(/\D/g, "") })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs tracking-widest focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-[10px] text-slate-400">
                  {editingLevel
                    ? "Isi hanya jika ingin mengganti 6-digit PIN keamanan peralihan."
                    : "Wajibkan 6 digit angka saat beralih ke jenjang ini."}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLevel(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : editingLevel ? "Simpan Perubahan" : "Daftarkan Jenjang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
