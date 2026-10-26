"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Pagination from "@/components/Pagination";
import { ExportButtons } from "@/lib/export-utils";
import { ArrowRightLeft, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

interface ClassroomItem {
  id: number;
  name: string;
}

interface StudentItem {
  id: number;
  name: string;
  nisn?: string;
  gender?: string;
  status?: string;
}

interface EnrollmentAuditResult {
  activeYear: { id: number; year: string } | null;
  summary: {
    nonActiveWithActiveEnrollment: number;
    duplicateActiveEnrollments: number;
    classroomMismatch: number;
    activeStudentsWithoutEnrollment: number;
  };
  samples: Array<{
    student_id: number;
    student_name: string;
    status: string;
    student_classroom_name: string | null;
    enrollment_classroom_name: string | null;
  }>;
}

export default function MutationsPage() {
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [action, setAction] = useState("pindah_kelas");
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  // Audit state
  const [audit, setAudit] = useState<EnrollmentAuditResult | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    loadClassrooms();
    loadAudit();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass, page);
    } else {
      setStudents([]);
      setPagination({ total: 0, page: 1, limit: 20, totalPages: 0 });
    }
    setSelected([]);
  }, [selectedClass, page]);

  const loadClassrooms = async () => {
    try {
      const res = await fetch("/api/classrooms?limit=1000");
      const json = await res.json();
      if (json.success) setClassrooms(json.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/students/enrollment-audit");
      const json = await res.json();
      if (json.success) setAudit(json.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAutoSync = async () => {
    const confirm = await Swal.fire({
      title: "Sinkronkan Data Otomatis?",
      text: "Sistem akan menyinkronkan kelas master dan enrollment siswa yang aktif.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Sinkronkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;

    setSyncLoading(true);
    try {
      const res = await fetch("/api/students/enrollment-audit", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          icon: "success",
          title: "Sinkronisasi Berhasil",
          text: json.message || "Data enrollment berhasil disinkronkan",
        });
        await loadAudit();
        if (selectedClass) await loadStudents(selectedClass, page);
      } else {
        Swal.fire("Gagal", json.message || "Terjadi kesalahan sinkronisasi", "error");
      }
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    } finally {
      setSyncLoading(false);
    }
  };

  const loadStudents = async (classId: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?classroom=${classId}&page=${pageNum}&limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setStudents(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selected.length === students.length && students.length > 0) {
      setSelected([]);
    } else {
      setSelected(students.map((s) => s.id));
    }
  };

  const handleExecute = async () => {
    if (selected.length === 0) return Swal.fire("Peringatan", "Pilih minimal 1 siswa", "warning");
    if (action === "pindah_kelas" && !targetClass) return Swal.fire("Peringatan", "Pilih kelas tujuan", "warning");

    const actionLabels: Record<string, string> = {
      pindah_kelas: "Pindah Kelas",
      lulus: "Kelulusan",
      pindah: "Pindah Sekolah",
      nonaktif: "Non-aktifkan",
    };

    const r = await Swal.fire({
      title: `Konfirmasi ${actionLabels[action]}`,
      text: `${selected.length} siswa akan diproses. Lanjutkan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Proses",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!r.isConfirmed) return;

    setExecuting(true);
    try {
      const res = await fetch("/api/mutations/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selected,
          action: action,
          targetClassroomId: action === "pindah_kelas" ? Number(targetClass) : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", json.message, "success");
        setSelected([]);
        loadAudit();
        if (selectedClass) loadStudents(selectedClass, page);
      } else {
        Swal.fire("Gagal", json.message || "Terjadi kesalahan", "error");
      }
    } catch {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    } finally {
      setExecuting(false);
    }
  };

  // Compute total mismatch issues
  const totalMismatch = audit
    ? (audit.summary.nonActiveWithActiveEnrollment || 0) +
      (audit.summary.duplicateActiveEnrollments || 0) +
      (audit.summary.classroomMismatch || 0) +
      (audit.summary.activeStudentsWithoutEnrollment || 0)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <PageHeader
        title="Mutasi Siswa"
        subtitle="Pindah kelas, kelulusan, atau perubahan status siswa."
        icon={<ArrowRightLeft className="w-5 h-5 text-blue-600" />}
        actions={
          <div className="flex items-center gap-2">
            <ExportButtons
              options={{
                title: "Data Calon Mutasi Siswa",
                filename: `mutasi_siswa_${new Date().toISOString().split("T")[0]}`,
                columns: [
                  { header: "No", key: "_no", width: 8, align: "center" },
                  { header: "NISN", key: "nisn", width: 15 },
                  { header: "Nama Siswa", key: "name", width: 35 },
                  { header: "JK", key: "gender", width: 10, align: "center" },
                  { header: "Status", key: "status", width: 15, align: "center" },
                ],
                data: students.map((s, i: number) => ({
                  ...s,
                  _no: (page - 1) * limit + i + 1,
                })),
              }}
            />
          </div>
        }
      />

      {/* Main Two-Column Layout (Form di Kanan, Tabel di Kiri) */}
      <div className="flex flex-col lg:flex-row-reverse gap-6 items-start">
        {/* Left Side Panel: Form Aksi & Audit Konsistensi */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Card Form Aksi Mutasi */}
          <Card className="p-5 border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Form Mutasi Siswa</h3>
              <p className="text-xs text-slate-500 mt-0.5">Konfigurasi mutasi & tujuan siswa</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kelas Asal</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white font-medium text-slate-800 transition-colors"
              >
                <option value="">— Pilih Kelas Asal —</option>
                <option value="none" className="text-rose-600 font-bold">
                  Tanpa Kelas (Siswa Baru)
                </option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Aksi Mutasi</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-800 transition-colors font-medium"
              >
                <option value="pindah_kelas">Pindah Kelas</option>
                <option value="lulus">Kelulusan</option>
                <option value="pindah">Pindah Sekolah</option>
                <option value="nonaktif">Non-aktifkan</option>
              </select>
            </div>

            {action === "pindah_kelas" && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kelas Tujuan</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-800 transition-colors font-medium"
                >
                  <option value="">— Pilih Kelas Tujuan —</option>
                  {classrooms
                    .filter((c) => c.id.toString() !== selectedClass)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Ringkasan Siswa Terpilih */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Siswa Terpilih:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${selected.length > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                  {selected.length} Siswa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {selected.length === 0
                  ? "Centang siswa di tabel sebelah kiri untuk memproses."
                  : `${selected.length} siswa siap diproses ke aksi "${action}".`}
              </p>
            </div>

            <button
              onClick={handleExecute}
              disabled={executing || selected.length === 0}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Eksekusi ({selected.length} Siswa)</span>
                </>
              )}
            </button>
          </Card>

          {/* Card Audit Konsistensi Data */}
          <Card className="p-5 border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Audit Konsistensi</h4>
                <p className="text-[11px] text-slate-500">
                  {audit?.activeYear ? `Tahun Aktif: ${audit.activeYear.year}` : "Pemeriksaan sinkronisasi"}
                </p>
              </div>
              <button
                onClick={loadAudit}
                disabled={auditLoading}
                title="Muat ulang audit"
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${auditLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>

            {auditLoading ? (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memeriksa konsistensi data...</span>
              </div>
            ) : audit ? (
              totalMismatch === 0 ? (
                /* Badge Hijau Tenang jika 0 anomali */
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800">✅ Status Data Sehat (100% Sinkron)</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 pl-6">
                    Semua kelas siswa dan catatan enrollment aktif cocok secara konsisten.
                  </p>
                </div>
              ) : (
                /* Mismatch Alert & Tombol Sinkronisasi */
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-amber-900">{totalMismatch} Inkonsistensi</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-full">
                        Perlu Sync
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                      Ditemukan ketidakcocokan antara kelas master dan rekaman enrollment tahun aktif.
                    </p>
                  </div>

                  {/* Ringkasan Isu */}
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {audit.summary.classroomMismatch > 0 && (
                      <div className="flex justify-between py-0.5">
                        <span className="text-[11px]">Kelas Master ≠ Enrollment:</span>
                        <span className="font-bold text-amber-700">{audit.summary.classroomMismatch}</span>
                      </div>
                    )}
                    {audit.summary.activeStudentsWithoutEnrollment > 0 && (
                      <div className="flex justify-between py-0.5">
                        <span className="text-[11px]">Aktif Tanpa Enrollment:</span>
                        <span className="font-bold text-amber-700">{audit.summary.activeStudentsWithoutEnrollment}</span>
                      </div>
                    )}
                    {audit.summary.duplicateActiveEnrollments > 0 && (
                      <div className="flex justify-between py-0.5">
                        <span className="text-[11px]">Duplicate Enrollment:</span>
                        <span className="font-bold text-amber-700">{audit.summary.duplicateActiveEnrollments}</span>
                      </div>
                    )}
                    {audit.summary.nonActiveWithActiveEnrollment > 0 && (
                      <div className="flex justify-between py-0.5">
                        <span className="text-[11px]">Non-aktif dg Enrollment:</span>
                        <span className="font-bold text-amber-700">{audit.summary.nonActiveWithActiveEnrollment}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleAutoSync}
                      disabled={syncLoading}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {syncLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyinkronkan...</span>
                        </>
                      ) : (
                        <span>⚡ Sinkronkan Otomatis (1-Klik)</span>
                      )}
                    </button>
                    <button
                      onClick={() => setShowAuditModal(true)}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-center cursor-pointer"
                    >
                      Lihat Detail ({audit.samples.length} sampel)
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-xs text-slate-400">Data audit tidak tersedia.</div>
            )}
          </Card>
        </div>

        {/* Right Side Panel: Tabel Siswa Kelas Asal */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          <Card className="p-0 overflow-hidden border-slate-200 shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Daftar Siswa Kelas Asal {selectedClass ? "" : "(Pilih Kelas Terlebih Dahulu)"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {students.length > 0 ? `Total ${pagination.total} siswa terdaftar` : "Belum ada siswa terpilih"}
                  </p>
                </div>
              </div>
              {students.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {selected.length} dari {students.length} terpilih
                  </span>
                  <button
                    onClick={toggleAll}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {selected.length === students.length ? "Batal Semua" : "Pilih Semua"}
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={students.length > 0 && selected.length === students.length}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label="Pilih semua siswa"
                      />
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-14">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">NISN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama Siswa</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-16">JK</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!selectedClass ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-sm text-slate-400">
                        Silakan pilih kelas asal pada panel sebelah kanan untuk menampilkan daftar siswa.
                      </td>
                    </tr>
                  ) : loading ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-sm text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Memuat daftar siswa...</span>
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-sm text-slate-400">
                        Tidak ada siswa di kelas ini.
                      </td>
                    </tr>
                  ) : (
                    students.map((s, i) => {
                      const isSelected = selected.includes(s.id);
                      return (
                        <tr
                          key={s.id}
                          onClick={() => toggleSelect(s.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(s.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              aria-label={`Pilih ${s.name}`}
                            />
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-mono text-slate-400 font-medium">
                            {(page - 1) * limit + i + 1}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-600">{s.nisn || "-"}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">{s.name}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                                s.gender === "L"
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : "bg-pink-100 text-pink-700 border border-pink-200"
                              }`}
                            >
                              {s.gender || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                              {s.status || "aktif"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {students.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <Pagination
                  page={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  total={pagination.total}
                  limit={limit}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal Popup Detail Audit (Hanya muncul jika tombol Lihat Detail diklik) */}
      <Modal
        open={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Detail Audit Konsistensi Siswa"
        subtitle={audit?.activeYear ? `Tahun Aktif: ${audit.activeYear.year} — Total Sampel Anomali: ${audit.samples.length}` : undefined}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setShowAuditModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                setShowAuditModal(false);
                handleAutoSync();
              }}
              disabled={syncLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>⚡ Sinkronkan Otomatis (1-Klik)</span>
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Daftar sampel siswa berikut memiliki ketidaksinkronan antara status siswa, kelas master, atau rekaman enrollment:
          </p>
          {audit && audit.samples.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-600 uppercase w-10">No</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 uppercase">Siswa</th>
                    <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-600 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 uppercase">Kelas Master</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 uppercase">Kelas Enrollment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {audit.samples.map((item, idx: number) => (
                    <tr key={item.student_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2 text-xs font-semibold text-slate-800">{item.student_name}</td>
                      <td className="px-3 py-2 text-center text-xs text-slate-600">{item.status}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{item.student_classroom_name || "-"}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{item.enrollment_classroom_name || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">Tidak ada sampel data anomali.</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
