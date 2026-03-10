"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

interface Classroom {
  id: number;
  name: string;
}

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // State untuk filter
  const [filters, setFilters] = useState({
    academicYearId: searchParams.get("academicYearId") || "",
    semester: searchParams.get("semester") || "",
    month: searchParams.get("month") || "",
    classroomId: searchParams.get("classroomId") || "",
    gender: searchParams.get("gender") || "",
  });

  useEffect(() => {
    // Ambil data Tahun Ajaran
    fetch("/api/academic-years")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAcademicYears(data.data);
          // Set default tahun ajaran aktif jika belum ada di URL
          const active = data.data.find((y: any) => y.isActive);
          if (active && !searchParams.get("academicYearId")) {
            updateFilter("academicYearId", String(active.id));
          }
        }
      });

    // Ambil data Kelas
    fetch("/api/classrooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClassrooms(data.data);
      });
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Khusus jika ganti tahun ajaran, reset kelas (karena kelas terikat tahun ajaran)
    if (key === "academicYearId") {
      params.delete("classroomId");
      setFilters(prev => ({ ...prev, classroomId: "" }));
    }

    setFilters((prev) => ({ ...prev, [key]: value }));
    router.push(`${pathname}?${params.toString()}`);
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Ajaran</label>
        <select
          value={filters.academicYearId}
          onChange={(e) => updateFilter("academicYearId", e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none"
        >
          <option value="">Semua Tahun</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year} {y.isActive ? "(Aktif)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Semester</label>
        <select
          value={filters.semester}
          onChange={(e) => updateFilter("semester", e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none"
        >
          <option value="">Semua</option>
          <option value="ganjil">Ganjil</option>
          <option value="genap">Genap</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bulan</label>
        <select
          value={filters.month}
          onChange={(e) => updateFilter("month", e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none"
        >
          <option value="">Semua Bulan</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelas</label>
        <select
          value={filters.classroomId}
          onChange={(e) => updateFilter("classroomId", e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none"
        >
          <option value="">Semua Kelas</option>
          {classrooms
            .filter(c => !filters.academicYearId || (c as any).academicYearId === Number(filters.academicYearId))
            .map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
        <select
          value={filters.gender}
          onChange={(e) => updateFilter("gender", e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none"
        >
          <option value="">Semua</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </div>

      <button
        onClick={() => {
          setFilters({ academicYearId: "", semester: "", month: "", classroomId: "", gender: "" });
          router.push(pathname);
        }}
        className="mt-5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        Reset Filter
      </button>
    </div>
  );
}
