"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  Layers3,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import FilterBar from "@/components/FilterBar";

interface Curriculum {
  id: number;
  type: string;
  academicYearId: number | null;
  semester: string;
  isLocked: boolean;
  createdAt?: string;
  academicYear?: {
    id: number;
    year: string;
  } | null;
}

interface GradeComponent {
  id: number;
  name: string;
  code: string;
  bobot: number;
  urutan: number;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface KkmItem {
  subjectId: number;
  nilaiKKM: number;
  deskripsiKKTP: string;
}

interface AcademicYearOption {
  id: number;
  year: string;
  isActive: boolean;
}

interface GradeComponentResponse {
  success: boolean;
  data: GradeComponent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SubjectResponse {
  success: boolean;
  data: Subject[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface KkmResponse {
  success: boolean;
  data: KkmItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AcademicYearOptionsResponse {
  success: boolean;
  data: AcademicYearOption[];
}

interface KkmDraft {
  nilai: number;
  deskripsi: string;
  saving?: boolean;
}

const COMPONENTS_PER_PAGE = 5;
const SUBJECTS_PER_PAGE = 10;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  const json = await response.json();

  if (!response.ok) {
    const message =
      typeof json?.message === "string"
        ? json.message
        : typeof json?.error === "string"
          ? json.error
          : "Terjadi kesalahan saat memproses data";

    throw new Error(message);
  }

  return json as T;
}

function getCurriculumMeta(type: string) {
  switch (type) {
    case "KURMER":
      return {
        label: "Kurikulum Merdeka",
        shortLabel: "KM",
        badgeClass: "border-indigo-100 bg-indigo-50 text-indigo-700",
        iconClass: "from-indigo-600 to-sky-500",
      };
    case "K13":
      return {
        label: "Kurikulum 2013",
        shortLabel: "K13",
        badgeClass: "border-emerald-100 bg-emerald-50 text-emerald-700",
        iconClass: "from-emerald-600 to-teal-500",
      };
    default:
      return {
        label: "Kurikulum Kustom",
        shortLabel: "CST",
        badgeClass: "border-amber-100 bg-amber-50 text-amber-700",
        iconClass: "from-amber-500 to-orange-500",
      };
  }
}

function getSemesterLabel(value: string) {
  return value === "genap" ? "Genap" : "Ganjil";
}

function MetricCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-300/50">
        {icon}
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black tracking-tight text-slate-800">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{caption}</p>
    </div>
  );
}

export default function CurriculumPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const selectedYearId = searchParams.get("academicYearId") || "";
  const semester = searchParams.get("semester") || "ganjil";

  const [subPage, setSubPage] = useState(1);
  const [compPage, setCompPage] = useState(1);
  const [creatingType, setCreatingType] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [newComp, setNewComp] = useState({
    name: "",
    code: "",
    bobot: "",
  });
  const [kkmDrafts, setKkmDrafts] = useState<Record<number, KkmDraft>>({});

  useEffect(() => {
    setSubPage(1);
    setCompPage(1);
  }, [selectedYearId, semester]);

  const academicYearsQuery = useQuery<AcademicYearOptionsResponse>({
    queryKey: ["curriculum-academic-year-options"],
    queryFn: () => fetchJson<AcademicYearOptionsResponse>("/api/academic-years?options=true"),
    staleTime: 1000 * 60 * 5,
  });

  const curriculumQuery = useQuery<Curriculum | null>({
    queryKey: ["curriculum-config", selectedYearId, semester],
    enabled: Boolean(selectedYearId),
    queryFn: async () => {
      const result = await fetchJson<Curriculum[]>(
        `/api/curriculum?academicYearId=${selectedYearId}&semester=${semester}`
      );
      return result[0] ?? null;
    },
  });

  const curriculum = curriculumQuery.data ?? null;

  const componentsQuery = useQuery<GradeComponentResponse>({
    queryKey: ["curriculum-components", curriculum?.id],
    enabled: Boolean(curriculum?.id),
    queryFn: () =>
      fetchJson<GradeComponentResponse>(
        `/api/grades/components?curriculumId=${curriculum?.id}&page=1&limit=100`
      ),
  });

  const kkmQuery = useQuery<KkmResponse>({
    queryKey: ["curriculum-kkm", curriculum?.id],
    enabled: Boolean(curriculum?.id),
    queryFn: () =>
      fetchJson<KkmResponse>(
        `/api/grades/kkm?curriculumId=${curriculum?.id}&page=1&limit=1000`
      ),
  });

  const subjectsQuery = useQuery<SubjectResponse>({
    queryKey: ["curriculum-subjects", subPage],
    queryFn: () =>
      fetchJson<SubjectResponse>(
        `/api/subjects?page=${subPage}&limit=${SUBJECTS_PER_PAGE}`
      ),
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    if (!curriculum?.id) {
      setKkmDrafts({});
      return;
    }

    const mapped = (kkmQuery.data?.data || []).reduce<Record<number, KkmDraft>>(
      (acc, item) => {
        acc[item.subjectId] = {
          nilai: item.nilaiKKM,
          deskripsi: item.deskripsiKKTP,
          saving: false,
        };
        return acc;
      },
      {}
    );

    setKkmDrafts(mapped);
  }, [curriculum?.id, kkmQuery.data]);

  const allComponents = componentsQuery.data?.data || [];
  const totalBobot = allComponents.reduce((total, item) => total + item.bobot, 0);
  const componentTotalPages = Math.max(
    1,
    Math.ceil(allComponents.length / COMPONENTS_PER_PAGE)
  );

  useEffect(() => {
    if (compPage > componentTotalPages) {
      setCompPage(componentTotalPages);
    }
  }, [compPage, componentTotalPages]);

  const pagedComponents = allComponents.slice(
    (compPage - 1) * COMPONENTS_PER_PAGE,
    compPage * COMPONENTS_PER_PAGE
  );

  const subjects = subjectsQuery.data?.data || [];
  const subjectPagination = subjectsQuery.data?.pagination || {
    total: 0,
    page: 1,
    limit: SUBJECTS_PER_PAGE,
    totalPages: 1,
  };

  const activeAcademicYear = academicYearsQuery.data?.data.find(
    (item) => item.id === Number(selectedYearId)
  );
  const academicYearLabel =
    curriculum?.academicYear?.year || activeAcademicYear?.year || "-";

  const savedKkmItems = kkmQuery.data?.data || [];
  const averageKkm = savedKkmItems.length
    ? Math.round(
        savedKkmItems.reduce((sum, item) => sum + item.nilaiKKM, 0) /
          savedKkmItems.length
      )
    : 75;

  const curriculumMeta = getCurriculumMeta(curriculum?.type || "KURMER");
  const curriculumLoading =
    Boolean(selectedYearId) &&
    (curriculumQuery.isLoading || curriculumQuery.isFetching) &&
    !curriculum;
  const hasCurriculumError = curriculumQuery.isError;

  async function refetchCurriculumSection() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["curriculum-config", selectedYearId, semester],
      }),
      queryClient.invalidateQueries({
        queryKey: ["curriculum-components", curriculum?.id],
      }),
      queryClient.invalidateQueries({
        queryKey: ["curriculum-kkm", curriculum?.id],
      }),
    ]);
  }

  async function handleCreate(type: string) {
    if (!selectedYearId) {
      await Swal.fire(
        "Pilih periode dulu",
        "Tentukan tahun ajaran pada filter sebelum membuat kurikulum.",
        "warning"
      );
      return;
    }

    setCreatingType(type);

    try {
      await fetchJson("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          academicYearId: Number(selectedYearId),
          semester,
        }),
      });

      await Swal.fire("Berhasil", "Kurikulum aktif berhasil dibuat.", "success");
      await refetchCurriculumSection();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal membuat kurikulum";
      await Swal.fire("Gagal", message, "error");
    } finally {
      setCreatingType(null);
    }
  }

  async function handleReset() {
    if (!curriculum) return;

    const result = await Swal.fire({
      title: "Reset kurikulum?",
      text: "Semua komponen nilai dan KKM pada periode ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, reset semua",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    setIsResetting(true);

    try {
      await fetchJson(`/api/curriculum/${curriculum.id}/reset`, {
        method: "POST",
      });

      setCompPage(1);
      setKkmDrafts({});
      await Swal.fire("Berhasil", "Kurikulum periode ini berhasil direset.", "success");
      await refetchCurriculumSection();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal reset kurikulum";
      await Swal.fire("Gagal", message, "error");
    } finally {
      setIsResetting(false);
    }
  }

  async function handleAddComponent() {
    if (!curriculum) return;

    const normalizedName = newComp.name.trim();
    const normalizedCode = newComp.code.trim().toUpperCase();
    const bobot = Number(newComp.bobot);

    if (!normalizedName || !normalizedCode) {
      await Swal.fire("Data belum lengkap", "Nama dan kode komponen wajib diisi.", "warning");
      return;
    }

    if (Number.isNaN(bobot) || bobot < 0) {
      await Swal.fire("Bobot tidak valid", "Masukkan bobot komponen yang benar.", "warning");
      return;
    }

    setIsAddingComponent(true);

    try {
      await fetchJson("/api/grades/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: curriculum.id,
          name: normalizedName,
          code: normalizedCode,
          bobot,
          urutan: allComponents.length + 1,
        }),
      });

      setNewComp({ name: "", code: "", bobot: "" });
      setCompPage(1);
      await queryClient.invalidateQueries({
        queryKey: ["curriculum-components", curriculum.id],
      });

      await Swal.fire({
        title: "Komponen ditambahkan",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menambah komponen";
      await Swal.fire("Gagal", message, "error");
    } finally {
      setIsAddingComponent(false);
    }
  }

  async function handleDeleteComponent(componentId: number) {
    if (!curriculum) return;

    try {
      await fetchJson(`/api/grades/components?id=${componentId}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({
        queryKey: ["curriculum-components", curriculum.id],
      });

      await Swal.fire({
        title: "Komponen dihapus",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1600,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus komponen";
      await Swal.fire("Gagal", message, "error");
    }
  }

  async function handleSaveKkm(subjectId: number) {
    if (!curriculum) return;

    const draft = kkmDrafts[subjectId] || { nilai: 75, deskripsi: "" };

    setKkmDrafts((previous) => ({
      ...previous,
      [subjectId]: {
        ...draft,
        saving: true,
      },
    }));

    try {
      await fetchJson("/api/grades/kkm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: curriculum.id,
          subjectId,
          nilaiKKM: draft.nilai,
          deskripsiKKTP: draft.deskripsi,
        }),
      });

      await queryClient.invalidateQueries({
        queryKey: ["curriculum-kkm", curriculum.id],
      });

      await Swal.fire({
        title: "KKM tersimpan",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menyimpan KKM";
      await Swal.fire("Gagal", message, "error");
      setKkmDrafts((previous) => ({
        ...previous,
        [subjectId]: {
          ...draft,
          saving: false,
        },
      }));
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Manajemen Kurikulum"
        subtitle="Atur standar kurikulum, komponen penilaian, dan KKM per periode secara lebih rapi dan konsisten."
        icon={<BookOpen className="h-5 w-5 text-white" />}
        gradient="from-slate-900 via-indigo-800 to-sky-700"
        actions={
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-right backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
              Periode Aktif
            </p>
            <p className="mt-1 text-sm font-black text-white">
              {academicYearLabel} • {getSemesterLabel(semester)}
            </p>
          </div>
        }
      />

      <FilterBar visibleFilters={["academicYear", "semester"]} />

      {!selectedYearId ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/80">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-300/70">
              <CalendarRange className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-slate-800">
              Pilih tahun ajaran dulu
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Filter periode di atas tetap otomatis seperti pengaturan sekarang. Setelah
              tahun ajaran terpilih, halaman ini akan langsung memuat konfigurasi kurikulum
              yang sesuai.
            </p>
          </div>
        </Card>
      ) : curriculumLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-11 w-11 rounded-2xl bg-slate-200" />
                <div className="mt-5 h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-3 h-7 w-40 rounded-full bg-slate-200" />
                <div className="mt-2 h-4 w-28 rounded-full bg-slate-100" />
              </Card>
            ))}
          </div>
          <Card className="animate-pulse">
            <div className="h-72 rounded-3xl bg-slate-100" />
          </Card>
        </div>
      ) : hasCurriculumError ? (
        <Card className="border-rose-200 bg-rose-50/80">
          <div className="py-12 text-center">
            <h3 className="text-xl font-black text-rose-700">Data kurikulum gagal dimuat</h3>
            <p className="mt-3 text-sm text-rose-600">
              {curriculumQuery.error instanceof Error
                ? curriculumQuery.error.message
                : "Silakan coba muat ulang halaman ini."}
            </p>
          </div>
        </Card>
      ) : curriculum ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Status"
              value={curriculum.isLocked ? "Terkunci" : "Aktif"}
              caption={
                curriculum.isLocked
                  ? "Perubahan nilai dibatasi untuk periode ini."
                  : "Pengaturan kurikulum masih dapat diperbarui."
              }
            />
            <MetricCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Tipe Kurikulum"
              value={curriculumMeta.label}
              caption={`Semester ${getSemesterLabel(curriculum.semester)}`}
            />
            <MetricCard
              icon={<Layers3 className="h-5 w-5" />}
              label="Komponen Nilai"
              value={`${allComponents.length} komponen`}
              caption={`Total bobot ${totalBobot.toFixed(0)}%`}
            />
            <MetricCard
              icon={<GraduationCap className="h-5 w-5" />}
              label="Standar KKM"
              value={`${averageKkm}`}
              caption={`${savedKkmItems.length} mapel sudah tersimpan`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-5">
              <Card className="overflow-hidden border-none bg-linear-to-br from-white via-slate-50 to-indigo-50 shadow-xl shadow-indigo-100/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-linear-to-br ${curriculumMeta.iconClass} text-base font-black text-white shadow-lg shadow-slate-300/60`}
                    >
                      {curriculumMeta.shortLabel}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Ringkasan Periode
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-800">
                        {curriculumMeta.label}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Konfigurasi aktif untuk {academicYearLabel} semester{" "}
                        {getSemesterLabel(curriculum.semester).toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${curriculumMeta.badgeClass}`}
                  >
                    {curriculum.isLocked ? "Locked" : "Editable"}
                  </span>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white bg-white/80 p-4 shadow-sm shadow-slate-200/60">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Tahun Ajaran
                    </p>
                    <p className="mt-2 text-lg font-black tracking-tight text-slate-800">
                      {academicYearLabel}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white bg-white/80 p-4 shadow-sm shadow-slate-200/60">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Semester
                    </p>
                    <p className="mt-2 text-lg font-black tracking-tight text-slate-800">
                      {getSemesterLabel(curriculum.semester)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white bg-white/80 p-4 shadow-sm shadow-slate-200/60">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Komponen Aktif
                    </p>
                    <p className="mt-2 text-lg font-black tracking-tight text-slate-800">
                      {allComponents.length} item
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white bg-white/80 p-4 shadow-sm shadow-slate-200/60">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      KKM Tersimpan
                    </p>
                    <p className="mt-2 text-lg font-black tracking-tight text-slate-800">
                      {savedKkmItems.length} mapel
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black tracking-tight text-rose-700">
                        Reset seluruh konfigurasi periode
                      </p>
                      <p className="mt-1 text-sm leading-6 text-rose-600/80">
                        Menghapus kurikulum, komponen nilai, dan KKM pada periode ini.
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      disabled={isResetting}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {isResetting ? "Mereset..." : "Reset Kurikulum"}
                    </button>
                  </div>
                </div>
              </Card>

              <Card
                title="Komponen Penilaian"
                icon={<Layers3 className="h-4 w-4" />}
                actions={
                  <div
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                      totalBobot === 100
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    Total {totalBobot.toFixed(0)}%
                  </div>
                }
                className="shadow-lg shadow-slate-200/50"
              >
                <div className="space-y-4">
                  {componentsQuery.isLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="h-4 w-28 rounded-full bg-slate-200" />
                        <div className="mt-3 h-3 w-40 rounded-full bg-slate-100" />
                      </div>
                    ))
                  ) : pagedComponents.length > 0 ? (
                    pagedComponents.map((component) => (
                      <div
                        key={component.id}
                        className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-sm">
                            {component.code}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {component.name}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-linear-to-r from-indigo-600 to-sky-500"
                                  style={{ width: `${Math.min(component.bobot, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs font-bold text-slate-500">
                                {component.bobot}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteComponent(component.id)}
                          disabled={curriculum.isLocked}
                          className="rounded-2xl p-3 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Hapus komponen ${component.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
                      <p className="text-lg font-black tracking-tight text-slate-700">
                        Belum ada komponen nilai
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Tambahkan struktur komponen agar input nilai per mata pelajaran
                        langsung konsisten.
                      </p>
                    </div>
                  )}

                  <Pagination
                    page={compPage}
                    totalPages={componentTotalPages}
                    total={allComponents.length}
                    limit={COMPONENTS_PER_PAGE}
                    onPageChange={setCompPage}
                  />

                  {!curriculum.isLocked && (
                    <div className="rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-sky-50 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">
                        Tambah Komponen Baru
                      </p>
                      <div className="mt-4 grid gap-3">
                        <input
                          type="text"
                          placeholder="Nama komponen, contoh: Sumatif Akhir"
                          className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                          value={newComp.name}
                          onChange={(event) =>
                            setNewComp((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                        />
                        <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
                          <input
                            type="text"
                            placeholder="Kode"
                            className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm font-semibold uppercase text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                            value={newComp.code}
                            onChange={(event) =>
                              setNewComp((previous) => ({
                                ...previous,
                                code: event.target.value,
                              }))
                            }
                          />
                          <input
                            type="number"
                            placeholder="Bobot %"
                            className="w-full rounded-2xl border border-white bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                            value={newComp.bobot}
                            onChange={(event) =>
                              setNewComp((previous) => ({
                                ...previous,
                                bobot: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <button
                          onClick={handleAddComponent}
                          disabled={isAddingComponent}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Plus className="h-4 w-4" />
                          {isAddingComponent ? "Menyimpan..." : "Tambah Komponen"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="xl:col-span-7">
              <Card
                title="KKM / KKTP Mata Pelajaran"
                icon={<GraduationCap className="h-4 w-4" />}
                className="h-full shadow-lg shadow-slate-200/50"
              >
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-black text-slate-800">
                    Data mapel dan KKM sekarang diambil langsung dari API terbaru per periode
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Tampilan ini tidak lagi bergantung pada Server Action client-side, jadi lebih
                    aman saat deployment baru di Vercel.
                  </p>
                </div>

                <div className="mt-5 space-y-4 md:hidden">
                  {subjects.map((subject) => {
                    const draft = kkmDrafts[subject.id] || {
                      nilai: 75,
                      deskripsi: "",
                      saving: false,
                    };

                    return (
                      <div
                        key={subject.id}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-800">{subject.name}</p>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                              {subject.code}
                            </p>
                          </div>
                          <input
                            type="number"
                            value={draft.nilai}
                            onChange={(event) =>
                              setKkmDrafts((previous) => ({
                                ...previous,
                                [subject.id]: {
                                  ...draft,
                                  nilai: Number(event.target.value),
                                },
                              }))
                            }
                            disabled={curriculum.isLocked}
                            className="w-24 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-black text-indigo-600 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                          />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan target capaian atau deskripsi KKTP..."
                          value={draft.deskripsi}
                          onChange={(event) =>
                            setKkmDrafts((previous) => ({
                              ...previous,
                              [subject.id]: {
                                ...draft,
                                deskripsi: event.target.value,
                              },
                            }))
                          }
                          disabled={curriculum.isLocked}
                          className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                        />
                        <button
                          onClick={() => handleSaveKkm(subject.id)}
                          disabled={curriculum.isLocked || draft.saving}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Save className="h-4 w-4" />
                          {draft.saving ? "Menyimpan..." : "Simpan KKM"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 hidden overflow-x-auto md:block">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Mata Pelajaran
                        </th>
                        <th className="px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Nilai Minimal
                        </th>
                        <th className="px-4 py-2 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Deskripsi KKTP
                        </th>
                        <th className="px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Simpan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => {
                        const draft = kkmDrafts[subject.id] || {
                          nilai: 75,
                          deskripsi: "",
                          saving: false,
                        };

                        return (
                          <tr key={subject.id} className="align-top">
                            <td className="rounded-l-3xl border-y border-l border-slate-200 bg-white px-4 py-4">
                              <p className="text-sm font-black text-slate-800">{subject.name}</p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                {subject.code}
                              </p>
                            </td>
                            <td className="border-y border-slate-200 bg-white px-4 py-4 text-center">
                              <input
                                type="number"
                                value={draft.nilai}
                                onChange={(event) =>
                                  setKkmDrafts((previous) => ({
                                    ...previous,
                                    [subject.id]: {
                                      ...draft,
                                      nilai: Number(event.target.value),
                                    },
                                  }))
                                }
                                disabled={curriculum.isLocked}
                                className="w-24 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-black text-indigo-600 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                              />
                            </td>
                            <td className="border-y border-slate-200 bg-white px-4 py-4">
                              <textarea
                                rows={2}
                                placeholder="Tuliskan target capaian atau deskripsi KKTP..."
                                value={draft.deskripsi}
                                onChange={(event) =>
                                  setKkmDrafts((previous) => ({
                                    ...previous,
                                    [subject.id]: {
                                      ...draft,
                                      deskripsi: event.target.value,
                                    },
                                  }))
                                }
                                disabled={curriculum.isLocked}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10"
                              />
                            </td>
                            <td className="rounded-r-3xl border-y border-r border-slate-200 bg-white px-4 py-4 text-center">
                              <button
                                onClick={() => handleSaveKkm(subject.id)}
                                disabled={curriculum.isLocked || draft.saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-indigo-600 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:text-white hover:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Save className="h-4 w-4" />
                                {draft.saving ? "Menyimpan..." : "Simpan"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {subjectsQuery.isLoading && (
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-24 animate-pulse rounded-3xl bg-slate-100"
                      />
                    ))}
                  </div>
                )}

                {subjectsQuery.isError && (
                  <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Gagal memuat daftar mata pelajaran.
                  </div>
                )}

                <div className="mt-6">
                  <Pagination
                    page={subPage}
                    totalPages={subjectPagination.totalPages}
                    total={subjectPagination.total}
                    limit={subjectPagination.limit}
                    onPageChange={setSubPage}
                  />
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card className="overflow-hidden border-none bg-linear-to-br from-white via-slate-50 to-indigo-50 shadow-2xl shadow-indigo-100/60">
          <div className="mx-auto max-w-5xl py-10">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-300/50">
                <BookOpen className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-4xl font-black tracking-tight text-slate-800">
                Setup kurikulum untuk {academicYearLabel}
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                Belum ada konfigurasi kurikulum pada semester{" "}
                {getSemesterLabel(semester).toLowerCase()}. Pilih standar yang ingin
                dipakai, lalu halaman ini akan langsung memuat data sesuai periode aktif.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {[
                {
                  type: "KURMER",
                  title: "Kurikulum Merdeka",
                  subtitle: "Fokus capaian pembelajaran yang fleksibel dan adaptif.",
                  accent: "from-indigo-600 to-sky-500",
                  surface: "bg-indigo-50 text-indigo-700",
                },
                {
                  type: "K13",
                  title: "Kurikulum 2013",
                  subtitle: "Format penilaian familiar untuk kebutuhan operasional sekolah.",
                  accent: "from-emerald-600 to-teal-500",
                  surface: "bg-emerald-50 text-emerald-700",
                },
                {
                  type: "CUSTOM",
                  title: "Kurikulum Kustom",
                  subtitle: "Struktur fleksibel untuk kebutuhan unit atau model belajar khusus.",
                  accent: "from-amber-500 to-orange-500",
                  surface: "bg-amber-50 text-amber-700",
                },
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleCreate(option.type)}
                  disabled={creatingType !== null}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-linear-to-br ${option.accent} text-lg font-black text-white shadow-lg shadow-slate-300/50`}
                  >
                    {option.type === "KURMER"
                      ? "KM"
                      : option.type === "K13"
                        ? "K13"
                        : "CST"}
                  </div>
                  <div className="mt-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${option.surface}`}
                    >
                      {getSemesterLabel(semester)}
                    </span>
                    <h4 className="mt-4 text-2xl font-black tracking-tight text-slate-800">
                      {option.title}
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {option.subtitle}
                    </p>
                  </div>
                  <div className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 transition-all group-hover:text-slate-900">
                    {creatingType === option.type ? "Membuat..." : "Pilih kurikulum"}
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
