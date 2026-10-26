"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import LeftDrawer from "@/components/ui/LeftDrawer";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { 
  ClipboardCheck, 
  Search, 
  Calculator, 
  FileText, 
  AlertCircle,
  Save,
  Zap,
  CheckCircle2
} from "lucide-react";

interface Option { id: number; name?: string; year?: string; isActive?: boolean; code?: string; type?: string; }
interface Student { id: number; name: string; nis?: string; }
interface GradeInput { studentId: number; nilaiAngka: number; predikat: string; }
interface CurriculumData { id: number; type: string; academicYearId?: number | null; semester?: string; gradeComponents?: Option[]; }
interface GradeComponent extends Option { bobot?: number; }
interface FinalGradeItem { id: number; studentId: number; nilaiAngka: number; predikat: string; nilaiPengetahuan: number; nilaiKeterampilan: number; nilaiAkhir: number; deskripsi: string; student?: Student; }

// Dummy function to mimic the engine locally on the frontend
function calcPredikatKurmer(n: number) { if (n >= 90) return "Sangat Baik"; if (n >= 80) return "Baik"; if (n >= 70) return "Cukup"; return "Kurang"; }
function calcPredikatK13(n: number) { if (n >= 90) return "A"; if (n >= 80) return "B"; if (n >= 70) return "C"; return "D"; }

export default function GradesPage({ 
  initialAcademicYears, 
  initialClassrooms, 
  initialSubjects,
  initialCurriculum = null
}: { 
  initialAcademicYears: Option[]; 
  initialClassrooms: Option[]; 
  initialSubjects: Option[];
  initialCurriculum?: CurriculumData | null;
}) {
  const [activeTab, setActiveTab] = useState("input");

  const [academicYears] = useState<Option[]>(initialAcademicYears);
  const [classrooms] = useState<Option[]>(initialClassrooms);
  const [subjects] = useState<Option[]>(initialSubjects);
  
  const [selectedYearId, setSelectedYearId] = useState(() => {
    const active = initialAcademicYears.find(y => y.isActive);
    return active ? String(active.id) : "";
  });
  const [semester, setSemester] = useState("ganjil");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(initialCurriculum);
  const [components, setComponents] = useState<Option[]>(initialCurriculum?.gradeComponents || []);
  const [selectedComponentId, setSelectedComponentId] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [grades, setGrades] = useState<Record<number, GradeInput>>({});
  const [kkm, setKkm] = useState(75);

  const [finalGrades, setFinalGrades] = useState<FinalGradeItem[]>([]);
  const [selectedFinalIds, setSelectedFinalIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBulkGradeDrawerOpen, setIsBulkGradeDrawerOpen] = useState(false);
  const [bulkGradeValue, setBulkGradeValue] = useState("85");

  // Memuat kurikulum setiap kali tahun ajaran atau semester berubah
  useEffect(() => {
    if (!selectedYearId) return;
    // Skip fetching if current curriculum already matches selection
    if (curriculum?.academicYearId === Number(selectedYearId) && curriculum?.semester === semester) {
        return;
    }

    fetch(`/api/curriculum?academicYearId=${selectedYearId}&semester=${semester}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          setCurriculum(data[0]);
          setComponents(data[0].gradeComponents || []);
        } else {
          setCurriculum(null);
          setComponents([]);
        }
      });
  }, [selectedYearId, semester, curriculum]);

  // Memuat siswa jika kelas berubah
  useEffect(() => {
    if (!selectedClassId) return;
    fetch(`/api/students?classroomId=${selectedClassId}`)
      .then(r => r.json())
      .then(data => {
        const list = data && data.success && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        setStudents(list);
      });
  }, [selectedClassId]);

  // Memuat KKM dan Grade yang sudah tersimpan untuk komponen tsb
  useEffect(() => {
    if (!curriculum || !selectedSubjectId) return;
    
    // Ambil KKM
    fetch(`/api/grades/kkm?curriculumId=${curriculum.id}&subjectId=${selectedSubjectId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) setKkm(data[0].nilaiKKM);
      });

    if (activeTab === "input" && selectedComponentId && selectedClassId) {
      setLoading(true);
      fetch(`/api/grades?componentId=${selectedComponentId}&classroomId=${selectedClassId}&subjectId=${selectedSubjectId}`)
        .then(r => r.json())
        .then(data => {
          const mapped: Record<number, GradeInput> = {};
          const list = data && data.success && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          list.forEach((d: { studentId: number; nilaiAngka: number; predikat: string }) => {
            mapped[d.studentId] = { studentId: d.studentId, nilaiAngka: d.nilaiAngka, predikat: d.predikat };
          });
          setGrades(mapped);
          setLoading(false);
        });
    }

    if ((activeTab === "akhir" || activeTab === "deskripsi") && selectedClassId) {
      loadFinalGrades();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubjectId, selectedComponentId, selectedClassId, activeTab, curriculum]);

  const loadFinalGrades = () => {
    if (!curriculum || !selectedClassId || !selectedSubjectId) return;
    setLoading(true);
    fetch(`/api/grades/final?curriculumId=${curriculum.id}&classroomId=${selectedClassId}&subjectId=${selectedSubjectId}`)
      .then(r => r.json())
      .then(data => {
        setFinalGrades(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  const handleGradeChange = (studentId: number, nilai: number) => {
    let p = calcPredikatK13(nilai);
    if (curriculum?.type === "KURMER") p = calcPredikatKurmer(nilai);
    
    setGrades(prev => ({
      ...prev,
      [studentId]: { studentId, nilaiAngka: nilai, predikat: p }
    }));
  };

  const handleBulkSetGrade = () => {
    if (selectedStudentIds.length === 0) return;
    setIsBulkGradeDrawerOpen(true);
  };

  const handleApplyBulkGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(bulkGradeValue);
    if (isNaN(num) || num < 0 || num > 100) {
      Swal.fire("Peringatan", "Nilai harus berupa angka antara 0 dan 100", "warning");
      return;
    }
    selectedStudentIds.forEach((id) => handleGradeChange(id, num));
    setIsBulkGradeDrawerOpen(false);
    Swal.fire("Berhasil", `Nilai ${num} berhasil diterapkan ke ${selectedStudentIds.length} siswa`, "success");
  };

  const saveGrades = async () => {
    if (!selectedComponentId || !selectedClassId || !selectedSubjectId) return;
    const items = students.map(s => {
      const g = grades[s.id] || { nilaiAngka: 0, predikat: "" };
      let p = g.predikat;
      if (!p) {
        p = curriculum?.type === "KURMER" ? calcPredikatKurmer(g.nilaiAngka) : calcPredikatK13(g.nilaiAngka);
      }
      return { studentId: s.id, nilaiAngka: g.nilaiAngka, predikat: p };
    });

    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          componentId: Number(selectedComponentId),
          classroomId: Number(selectedClassId),
          subjectId: Number(selectedSubjectId),
          grades: items,
        })
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Nilai berhasil disimpan", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hitungNilaiAkhir = async () => {
    if (!curriculum || !selectedClassId || !selectedSubjectId) {
      Swal.fire("Peringatan", "Pilih kurikulum, kelas, dan mapel", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/grades/final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: curriculum.id,
          classroomId: Number(selectedClassId),
          subjectId: Number(selectedSubjectId),
        })
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Nilai Akhir dan Deskripsi Berhasil Dihitung", "success");
        loadFinalGrades();
      } else {
        Swal.fire("Gagal", "Error", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageHeader
        title="Manajemen Nilai & Deskripsi"
        subtitle="Input penilaian terstruktur dan otomatisasi pembuatan deskripsi capaian kompetensi."
        icon={<ClipboardCheck className="w-6 h-6 text-blue-600" />}
      />

      {/* Filter Section */}
      <Card compact>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tahun Ajaran</span>
            <select
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
            >
              <option value="">-- Pilih --</option>
              {academicYears.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>
          </label>
          <label>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</span>
            <select
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </label>
          <label>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelas</span>
            <select
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              <option value="">-- Pilih Kelas --</option>
              {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mata Pelajaran</span>
            <select
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              <option value="">-- Pilih Mapel --</option>
              {subjects.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
      </Card>

      {!curriculum ? (
        <Card>
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-800">Kurikulum Belum Diatur</h3>
              <p className="text-sm text-slate-500 mt-1">
                Kurikulum belum tersedia untuk Tahun Ajaran/Semester ini. Silakan atur konfigurasi kurikulum terlebih dahulu di menu Kurikulum.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card noPadding>
          {/* Tabs Navigation */}
          <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setActiveTab("input")}
              className={`px-6 py-4 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'input' ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50'}`}
            >
              <Search className="w-4 h-4" />
              1. Input Nilai
            </button>
            <button
              onClick={() => setActiveTab("akhir")}
              className={`px-6 py-4 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'akhir' ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50'}`}
            >
              <Calculator className="w-4 h-4" />
              2. Kalkulasi Akhir
            </button>
            <button
              onClick={() => setActiveTab("deskripsi")}
              className={`px-6 py-4 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'deskripsi' ? 'text-blue-600 border-blue-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/50'}`}
            >
              <FileText className="w-4 h-4" />
              3. Deskripsi Naratif
            </button>
          </div>

          <div className="p-6">
            {activeTab === "input" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700 whitespace-nowrap">Pilih Komponen:</span>
                    <select
                      className="rounded-lg border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[240px]"
                      value={selectedComponentId}
                      onChange={(e) => setSelectedComponentId(e.target.value)}
                    >
                      <option value="">-- Pilih Komponen Nilai --</option>
                      {components.map((c) => <option key={c.id} value={c.id}>{c.name} ({(c as GradeComponent).bobot}%)</option>)}
                    </select>
                  </div>
                  <div className="px-4 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">KKM Dasar:</span>
                    <span className="text-sm font-black text-blue-700">{kkm}</span>
                  </div>
                </div>

                {!selectedClassId || !selectedSubjectId || !selectedComponentId ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-12 h-12 mb-3 opacity-20" />
                    <p className="italic text-sm">Pilih kelas, mapel, dan komponen penilaian.</p>
                  </div>
                ) : loading ? (
                  <div className="py-12 text-center text-blue-600 font-medium animate-pulse">Memuat data penilaian...</div>
                ) : (
                  <div className="space-y-6">
                    {selectedStudentIds.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fade-in">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{selectedStudentIds.length} siswa dipilih</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleBulkSetGrade}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            Set Nilai Masal
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentIds([])}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={students.length > 0 && selectedStudentIds.length === students.length}
                                onChange={(e) => setSelectedStudentIds(e.target.checked ? students.map((s: Student) => s.id) : [])}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                                aria-label="Pilih semua siswa"
                              />
                            </th>
                            <th className="px-3 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-12">No</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">NIS</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Nama Lengkap</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-40">Nilai (0-100)</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-24">Predikat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students.map((student, idx: number) => {
                            const g = grades[student.id];
                            const nilai = g?.nilaiAngka ?? 0;
                            const isUnderKkm = nilai > 0 && nilai < kkm;
                            const isSelected = selectedStudentIds.includes(student.id);
                            
                            return (
                              <tr key={student.id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedStudentIds(prev => [...prev, student.id]);
                                      else setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                                    aria-label={`Pilih ${student.name}`}
                                  />
                                </td>
                                <td className="px-3 py-3.5 text-center text-xs font-mono font-medium text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{student.nis}</td>
                                <td className="px-4 py-3.5 font-semibold text-slate-800">{student.name}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <input
                                    type="number"
                                    min="0" max="100"
                                    className={`w-24 text-center text-lg font-bold border rounded-lg px-2 py-1.5 outline-none transition-all focus:ring-4 ${isUnderKkm ? "border-red-200 text-red-600 bg-red-50 focus:ring-red-100" : "border-slate-200 text-slate-700 focus:border-blue-500 focus:ring-blue-100"}`}
                                    value={nilai || ""}
                                    onChange={(e) => handleGradeChange(student.id, Number(e.target.value))}
                                  />
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-black ${g?.predikat ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-400 font-semibold"}`}>
                                    {g?.predikat || "-"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={saveGrades} 
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Simpan Draft Nilai
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "akhir" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-linear-to-r from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Kalkulasi Nilai Akhir</h3>
                    <p className="text-white/80 text-sm max-w-xl">
                      Sistem akan memproses seluruh komponen nilai (Formatif, Sumatif, dll) berdasarkan bobot yang telah dikonfigurasi pada kurikulum.
                    </p>
                  </div>
                  <button 
                    onClick={hitungNilaiAkhir} 
                    className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    Proses Sekarang
                  </button>
                </div>

                {loading ? (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 font-medium">Mengkalkulasi nilai akhir...</p>
                  </div>
                ) : finalGrades.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 grayscale opacity-50">
                    <Calculator className="w-16 h-16 mb-4" />
                    <p className="font-bold text-lg">Belum Ada Data Hasil Kalkulasi</p>
                    <p className="text-sm italic">Klik tombol &quot;Proses Sekarang&quot; untuk memulai perhitungan.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedFinalIds.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fade-in">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{selectedFinalIds.length} hasil kalkulasi dipilih</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFinalIds([])}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                    <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 px-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={finalGrades.length > 0 && selectedFinalIds.length === finalGrades.length}
                                onChange={(e) => setSelectedFinalIds(e.target.checked ? finalGrades.map((f: FinalGradeItem) => f.id) : [])}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                                aria-label="Pilih semua hasil"
                              />
                            </th>
                            <th className="px-3 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-12">No</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Peserta Didik</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-32">Pgt</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-32">Ket</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center w-32">Akhir</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Predikat</th>
                            <th className="px-4 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {finalGrades.map((f, fIdx: number) => {
                            const isFinSelected = selectedFinalIds.includes(f.id);
                            return (
                            <tr key={f.id} className={`hover:bg-slate-50/50 transition-colors ${isFinSelected ? "bg-blue-50/40" : ""}`}>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isFinSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedFinalIds(prev => [...prev, f.id]);
                                    else setSelectedFinalIds(prev => prev.filter(id => id !== f.id));
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                                  aria-label={`Pilih ${f.student?.name}`}
                                />
                              </td>
                              <td className="px-3 py-4 text-center text-xs font-mono font-medium text-slate-400">{fIdx + 1}</td>
                              <td className="px-4 py-4 font-bold text-slate-800">{f.student?.name}</td>
                              <td className="px-4 py-4 text-center font-medium">{f.nilaiPengetahuan}</td>
                              <td className="px-4 py-4 text-center font-medium">{f.nilaiKeterampilan}</td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-lg font-black text-blue-600">{f.nilaiAkhir}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="px-2 py-1 bg-slate-100 rounded font-black text-slate-700">{f.predikat}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {f.nilaiAkhir >= kkm ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold ring-1 ring-emerald-100">
                                    Tuntas
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold ring-1 ring-rose-100">
                                    Belum Tuntas
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "deskripsi" && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">
                    <strong>Catatan:</strong> Deskripsi ini dihasilkan secara otomatis dari sistem pakar untuk membantu efisiensi Bapak/Ibu Guru. Anda tetap dapat mengedit narasi di bawah ini untuk hasil yang lebih personal.
                  </p>
                </div>

                {finalGrades.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-16 h-16 mb-4 opacity-20" />
                    <p className="italic text-sm">Lakukan kalkulasi nilai akhir terlebih dahulu untuk melihat deskripsi.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {finalGrades.map((f) => (
                        <div key={f.id} className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                              {f.student?.name}
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded leading-none">NIS: {f.student?.nis}</span>
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Nilai Akhir:</span>
                              <span className="text-sm font-black text-blue-600 px-2 py-0.5 bg-blue-50 rounded italic">{f.nilaiAkhir} ({f.predikat})</span>
                            </div>
                          </div>
                          <textarea
                            className="w-full min-h-[100px] text-sm leading-relaxed border-slate-200 bg-slate-50/50 rounded-xl p-4 outline-none transition-all focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400"
                            defaultValue={f.deskripsi}
                            placeholder="Tuliskan catatan kemajuan belajar atau deskripsi naratif di sini..."
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end sticky bottom-6">
                      <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                        <Save className="w-5 h-5" />
                        Simpan Semua Deskripsi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* LeftDrawer Panel Set Nilai Masal */}
      <LeftDrawer
        isOpen={isBulkGradeDrawerOpen}
        onClose={() => setIsBulkGradeDrawerOpen(false)}
        title="Input Nilai Masal"
        subtitle={`Terapkan nilai serentak untuk ${selectedStudentIds.length} siswa terpilih`}
        width="max-w-md"
      >
        <form onSubmit={handleApplyBulkGrade} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Input Nilai (0 - 100) <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="number"
              min="0"
              max="100"
              value={bulkGradeValue}
              onChange={(e) => setBulkGradeValue(e.target.value)}
              placeholder="Contoh: 85"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Preset Cepat:</label>
            <div className="grid grid-cols-4 gap-2">
              {["75", "80", "85", "90"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBulkGradeValue(preset)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    bulkGradeValue === preset
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-700">
            <p className="font-semibold">Estimasi Predikat:</p>
            <p className="text-sm font-bold mt-0.5">
              {curriculum?.type === "KURMER"
                ? calcPredikatKurmer(Number(bulkGradeValue) || 0)
                : calcPredikatK13(Number(bulkGradeValue) || 0)}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsBulkGradeDrawerOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Terapkan ke {selectedStudentIds.length} Siswa
            </button>
          </div>
        </form>
      </LeftDrawer>
    </div>
  );
}
