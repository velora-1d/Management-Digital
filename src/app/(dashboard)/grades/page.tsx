"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Option { id: number; name?: string; year?: string; isActive?: boolean; code?: string; type?: string; }
interface Student { id: number; name: string; nis?: string; }
interface GradeInput { studentId: number; nilaiAngka: number; predikat: string; }

// Dummy function to mimic the engine locally on the frontend
function calcPredikatKurmer(n: number) { if (n >= 90) return "Sangat Baik"; if (n >= 80) return "Baik"; if (n >= 70) return "Cukup"; return "Kurang"; }
function calcPredikatK13(n: number) { if (n >= 90) return "A"; if (n >= 80) return "B"; if (n >= 70) return "C"; return "D"; }

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState("input");

  const [academicYears, setAcademicYears] = useState<Option[]>([]);
  const [classrooms, setClassrooms] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  
  const [selectedYearId, setSelectedYearId] = useState("");
  const [semester, setSemester] = useState("ganjil");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  
  const [curriculum, setCurriculum] = useState<any>(null);
  const [components, setComponents] = useState<Option[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<number, GradeInput>>({});
  const [kkm, setKkm] = useState(75);

  const [finalGrades, setFinalGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/academic-years").then(r => r.json()),
      fetch("/api/classrooms").then(r => r.json()),
      fetch("/api/subjects").then(r => r.json()),
    ]).then(([years, classes, subs]) => {
      setAcademicYears(years);
      setClassrooms(classes);
      setSubjects(subs);
      const active = years.find((y: any) => y.isActive);
      if (active) setSelectedYearId(String(active.id));
    }).catch(console.error);
  }, []);

  // Memuat kurikulum setiap kali tahun ajaran atau semester berubah
  useEffect(() => {
    if (!selectedYearId) return;
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
  }, [selectedYearId, semester]);

  // Memuat siswa jika kelas berubah
  useEffect(() => {
    if (!selectedClassId) return;
    fetch(`/api/students?classroomId=${selectedClassId}`)
      .then(r => r.json())
      .then(data => setStudents(data));
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
          data.forEach((d: any) => {
            mapped[d.studentId] = { studentId: d.studentId, nilaiAngka: d.nilaiAngka, predikat: d.predikat };
          });
          setGrades(mapped);
          setLoading(false);
        });
    }

    if ((activeTab === "akhir" || activeTab === "deskripsi") && selectedClassId) {
      loadFinalGrades();
    }
  }, [selectedSubjectId, selectedComponentId, selectedClassId, activeTab, curriculum]);

  const loadFinalGrades = () => {
    if (!curriculum || !selectedClassId || !selectedSubjectId) return;
    setLoading(true);
    fetch(`/api/grades/final?curriculumId=${curriculum.id}&classroomId=${selectedClassId}&subjectId=${selectedSubjectId}`)
      .then(r => r.json())
      .then(data => {
        setFinalGrades(data);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Nilai & Deskripsi</h1>
          <p className="text-sm text-slate-500 mt-1">Input penilaian terstruktur dan otomatisasi pembuatan deskripsi capaian capaian</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid md:grid-cols-4 gap-4">
        <label>
          <span className="block text-sm font-semibold text-slate-700 mb-2">Tahun Ajaran</span>
          <select
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 outline-none"
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
          >
            <option value="">-- Pilih --</option>
            {academicYears.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-sm font-semibold text-slate-700 mb-2">Semester</span>
          <select
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 outline-none"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="ganjil">Ganjil</option>
            <option value="genap">Genap</option>
          </select>
        </label>
        <label>
          <span className="block text-sm font-semibold text-slate-700 mb-2">Kelas</span>
          <select
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 outline-none"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">-- Pilih Kelas --</option>
            {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          <span className="block text-sm font-semibold text-slate-700 mb-2">Mata Pelajaran</span>
          <select
            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2 outline-none"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
          >
            <option value="">-- Pilih Mapel --</option>
            {subjects.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      {!curriculum ? (
        <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
          Kurikulum belum diatur untuk Tahun Ajaran/Semester ini. Silakan atur di menu Kurikulum dahulu.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("input")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'input' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              1. Input Nilai Komponen
            </button>
            <button
              onClick={() => setActiveTab("akhir")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'akhir' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              2. Kalkulasi Nilai Akhir
            </button>
            <button
              onClick={() => setActiveTab("deskripsi")}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'deskripsi' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              3. Deskripsi Naratif
            </button>
          </div>

          <div className="p-6">
            {activeTab === "input" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <label className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">Pilih Komponen:</span>
                    <select
                      className="rounded-lg border-slate-200 bg-slate-50 px-4 py-2 outline-none min-w-[200px]"
                      value={selectedComponentId}
                      onChange={(e) => setSelectedComponentId(e.target.value)}
                    >
                      <option value="">-- Komponen Nilai --</option>
                      {components.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.bobot}%)</option>)}
                    </select>
                  </label>
                  <p className="text-sm text-slate-500">Nilai KKM Saat Ini: <strong className="text-slate-800">{kkm}</strong></p>
                </div>

                {!selectedClassId || !selectedSubjectId || !selectedComponentId ? (
                  <p className="text-center text-slate-500 italic">Pilih kelas, mapel, dan komponen nilai untuk mulai mengisi.</p>
                ) : loading ? (
                  <p className="text-center">Memuat...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="px-4 py-3 font-semibold">NIS</th>
                          <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                          <th className="px-4 py-3 font-semibold text-center w-32">Nilai Angka</th>
                          <th className="px-4 py-3 font-semibold text-center w-24">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map(student => {
                          const g = grades[student.id];
                          const nilai = g?.nilaiAngka ?? 0;
                          const isUnderKkm = nilai > 0 && nilai < kkm;
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono">{student.nis}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min="0" max="100"
                                  className={`w-20 text-center border rounded-lg px-2 py-1 outline-none focus:ring-2 ${isUnderKkm ? "border-red-300 text-red-600 bg-red-50 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"}`}
                                  value={nilai || ""}
                                  onChange={(e) => handleGradeChange(student.id, Number(e.target.value))}
                                />
                              </td>
                              <td className="px-4 py-3 text-center font-bold">
                                {g?.predikat || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="mt-6 flex justify-end">
                      <button onClick={saveGrades} className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700">Simpan Draft Nilai</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "akhir" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-800">Kalkulasi nilai akhir akan memadukan seluruh komponen dari Mapel ini berdasarkan formula persentase (bobot).</p>
                  <button onClick={hitungNilaiAkhir} className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm text-sm font-semibold">
                    ⚡ Hitung Nilai Akhir
                  </button>
                </div>

                {loading ? (
                  <p className="text-center p-8 text-slate-500">Mengkalkulasi...</p>
                ) : finalGrades.length === 0 ? (
                  <p className="text-center p-8 text-slate-500 italic">Belum ada kalkulasi nilai akhir.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="px-4 py-3 font-semibold">Siswa</th>
                          <th className="px-4 py-3 font-semibold text-center">Pengetahuan</th>
                          <th className="px-4 py-3 font-semibold text-center">Keterampilan</th>
                          <th className="px-4 py-3 font-semibold text-center">Nilai Akhir</th>
                          <th className="px-4 py-3 font-semibold text-center">Predikat</th>
                          <th className="px-4 py-3 font-semibold text-center">KKM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {finalGrades.map((f: any) => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{f.student?.name}</td>
                            <td className="px-4 py-3 text-center">{f.nilaiPengetahuan}</td>
                            <td className="px-4 py-3 text-center">{f.nilaiKeterampilan}</td>
                            <td className="px-4 py-3 text-center font-bold text-indigo-700">{f.nilaiAkhir}</td>
                            <td className="px-4 py-3 text-center font-bold">{f.predikat}</td>
                            <td className="px-4 py-3 text-center">
                              {f.nilaiAkhir >= kkm ? <span className="text-green-600">Lulus</span> : <span className="text-red-600 font-bold">Tidak Tuntas</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "deskripsi" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  Deskripsi naratif ini digenerate secara otomatis saat Anda melakukan "Hitung Nilai Akhir". Anda tetap dapat mengubahnya secara manual jika diperlukan.
                </p>

                {finalGrades.length === 0 ? (
                  <p className="text-center p-8 text-slate-500 italic">Nilai akhir belum dihitung.</p>
                ) : (
                  <div className="space-y-4">
                    {finalGrades.map((f: any) => (
                      <div key={f.id} className="p-4 border border-slate-100 shadow-sm rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800">{f.student?.name}</span>
                          <span className="text-xs px-2 py-1 bg-slate-100 rounded-md font-semibold text-slate-600">Nilai: {f.nilaiAkhir} ({f.predikat})</span>
                        </div>
                        <textarea
                          className="w-full h-20 text-sm border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-200"
                          defaultValue={f.deskripsi}
                          placeholder="Masukkan catatan deskripsi capaian kompetensi..."
                        />
                      </div>
                    ))}
                    <div className="flex justify-end pt-2">
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700">Simpan Perubahan Deskripsi</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
