"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

interface Classroom {
  id: number;
  name: string;
  academicYearId?: number;
}

export type FilterType = 
  | "academicYear" 
  | "semester" 
  | "month" 
  | "classroom" 
  | "gender" 
  | "status" 
  | "type" 
  | "ageRange";

interface FilterBarProps {
  visibleFilters?: FilterType[];
  customStatusOptions?: { label: string; value: string }[];
  customTypeOptions?: { label: string; value: string }[];
}

export default function FilterBar({ 
  visibleFilters = ["academicYear", "semester", "month", "classroom", "gender"],
  customStatusOptions,
  customTypeOptions
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    academicYearId: searchParams.get("academicYearId") || "",
    semester: searchParams.get("semester") || "",
    month: searchParams.get("month") || "",
    classroomId: searchParams.get("classroomId") || "",
    gender: searchParams.get("gender") || "",
    status: searchParams.get("status") || "",
    type: searchParams.get("type") || "",
    ageMin: searchParams.get("ageMin") || "",
    ageMax: searchParams.get("ageMax") || "",
  });

  // Sinkronkan state filters dengan URL saat searchParams berubah
  useEffect(() => {
    setFilters({
      academicYearId: searchParams.get("academicYearId") || "",
      semester: searchParams.get("semester") || "",
      month: searchParams.get("month") || "",
      classroomId: searchParams.get("classroomId") || "",
      gender: searchParams.get("gender") || "",
      status: searchParams.get("status") || "",
      type: searchParams.get("type") || "",
      ageMin: searchParams.get("ageMin") || "",
      ageMax: searchParams.get("ageMax") || "",
    });
  }, [searchParams]);

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key === "academicYearId") {
      params.delete("classroomId");
      setFilters(prev => ({ ...prev, classroomId: "" }));
    }

    setFilters((prev) => ({ ...prev, [key]: value }));
    
    // Update URL instantly without hitting the server for RSC payload
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    // Trigger popstate to notify Next.js searchParams hook to update
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, [pathname, searchParams]);

  const { data: academicYears = [] } = useQuery<AcademicYear[]>({
    queryKey: ["filter-options", "academic-years"],
    queryFn: async () => {
      const res = await fetch("/api/academic-years?options=true");
      const data = await res.json();
      return data.success ? data.data || [] : [];
    },
    enabled: visibleFilters.includes("academicYear") || visibleFilters.includes("classroom"),
    staleTime: 1000 * 60 * 15,
  });

  const classroomAcademicYearId =
    filters.academicYearId && filters.academicYearId !== "all"
      ? filters.academicYearId
      : "all";

  const { data: classrooms = [] } = useQuery<Classroom[]>({
    queryKey: ["filter-options", "classrooms", classroomAcademicYearId],
    queryFn: async () => {
      const params = new URLSearchParams({ options: "true" });
      if (classroomAcademicYearId) {
        params.set("academicYearId", classroomAcademicYearId);
      }
      const res = await fetch(`/api/classrooms?${params.toString()}`);
      const data = await res.json();
      return data.success ? data.data || [] : [];
    },
    enabled: visibleFilters.includes("classroom"),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (academicYears.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const active = academicYears.find((y) => y.isActive);
    let needsUpdate = false;

    if (active && !params.get("academicYearId") && visibleFilters.includes("academicYear")) {
      params.set("academicYearId", String(active.id));
      needsUpdate = true;
    }

    const now = new Date();
    const monthIdx = now.getMonth();
    const monthsList = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    if (!params.get("month") && visibleFilters.includes("month")) {
      params.set("month", monthsList[monthIdx]);
      needsUpdate = true;
    }

    if (!params.get("semester") && visibleFilters.includes("semester")) {
      params.set("semester", monthIdx >= 6 ? "ganjil" : "genap");
      needsUpdate = true;
    }

    if (needsUpdate) {
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [academicYears, pathname, visibleFilters]);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const isVisible = (type: FilterType) => visibleFilters.includes(type);

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/60 mb-6 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
      {isVisible("academicYear") && (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tahun Ajaran</label>
          <select
            value={filters.academicYearId}
            onChange={(e) => updateFilter("academicYearId", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="all">Semua Tahun</option>
            {academicYears.map((y) => (
              <option key={y.id} value={String(y.id)}>
                {y.year} {y.isActive ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {isVisible("semester") && (
        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Semester</label>
          <select
            value={filters.semester}
            onChange={(e) => updateFilter("semester", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua</option>
            <option value="ganjil">Ganjil</option>
            <option value="genap">Genap</option>
          </select>
        </div>
      )}

      {isVisible("month") && (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bulan</label>
          <select
            value={filters.month}
            onChange={(e) => updateFilter("month", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Bulan</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {isVisible("classroom") && (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kelas</label>
          <select
            value={filters.classroomId}
            onChange={(e) => updateFilter("classroomId", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Kelas</option>
            {classrooms
              .map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
          </select>
        </div>
      )}

      {isVisible("gender") && (
        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => updateFilter("gender", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      )}

      {isVisible("status") && (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Status</option>
            {customStatusOptions ? (
              customStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
            ) : (
              <>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
                <option value="lulus">Lulus</option>
                <option value="pindah">Pindah</option>
              </>
            )}
          </select>
        </div>
      )}

      {isVisible("type") && (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tipe</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Tipe</option>
            {customTypeOptions?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {isVisible("ageRange") && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Umur Min</label>
            <input 
              type="number"
              placeholder="Min"
              value={filters.ageMin}
              onChange={(e) => updateFilter("ageMin", e.target.value)}
              className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-20 p-2.5 font-semibold outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Umur Max</label>
            <input 
              type="number"
              placeholder="Max"
              value={filters.ageMax}
              onChange={(e) => updateFilter("ageMax", e.target.value)}
              className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-20 p-2.5 font-semibold outline-none transition-all"
            />
          </div>
        </>
      )}

      <button
        onClick={() => {
          setFilters({ 
            academicYearId: "", semester: "", month: "", classroomId: "", gender: "", status: "", type: "", ageMin: "", ageMax: "" 
          });
          router.push(pathname);
        }}
        className="mt-4 px-4 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
      >
        Reset Filter
      </button>
    </div>
  );
}
