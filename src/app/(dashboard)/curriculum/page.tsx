"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

interface Curriculum {
  id: number;
  type: string;
  academicYearId: number;
  semester: string;
  isLocked: boolean;
  academicYear?: AcademicYear;
  gradeComponents?: GradeComponent[];
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

export default function CurriculumPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [semester, setSemester] = useState<string>("ganjil");

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState("KURMER");

  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [newComponentName, setNewComponentName] = useState("");
  const [newComponentCode, setNewComponentCode] = useState("");
  const [newComponentBobot, setNewComponentBobot] = useState(0);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [kkmData, setKkmData] = useState<Record<number, { nilai: number; deskripsi: string }>>({});

  useEffect(() => {
    fetch("/api/academic-years")
      .then((res) => res.json())
      .then((data: AcademicYear[]) => {
        setAcademicYears(data);
        const active = data.find((y) => y.isActive);
        if (active) setSelectedYearId(String(active.id));
      })
      .catch(console.error);

    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedYearId) return;
    loadCurriculum(selectedYearId, semester);
  }, [selectedYearId, semester]);

  const loadCurriculum = async (yearId: string, sem: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/curriculum?academicYearId=${yearId}&semester=${sem}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCurriculum(data[0]);
        setFormType(data[0].type);
        setComponents(data[0].gradeComponents || []);
        loadKkm(data[0].id);
      } else {
        setCurriculum(null);
        setComponents([]);
        setKkmData({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadKkm = async (curriculumId: number) => {
    try {
      const res = await fetch(`/api/grades/kkm?curriculumId=${curriculumId}`);
      const data = await res.json();
      const mapped: any = {};
      data.forEach((k: any) => {
        mapped[k.subjectId] = { nilai: k.nilaiKKM, deskripsi: k.deskripsiKKTP };
      });
      setKkmData(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  const createCurriculum = async () => {
    if (!selectedYearId || !semester || !formType) return;
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYearId: Number(selectedYearId),
          semester,
          type: formType,
        }),
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Kurikulum diset", "success");
        loadCurriculum(selectedYearId, semester);
      } else {
        const error = await res.json();
        Swal.fire("Gagal", error.error || "Gagal menyimpan", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addComponent = async () => {
    if (!curriculum) return;
    if (!newComponentName || !newComponentCode || newComponentBobot <= 0) {
      Swal.fire("Error", "Cek input komponen", "error");
      return;
    }
    try {
      const res = await fetch("/api/grades/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: curriculum.id,
          name: newComponentName,
          code: newComponentCode,
          bobot: newComponentBobot,
          urutan: components.length + 1,
        }),
      });
      if (res.ok) {
        const newComp = await res.json();
        setComponents([...components, newComp]);
        setNewComponentName("");
        setNewComponentCode("");
        setNewComponentBobot(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveKkm = async (subjectId: number) => {
    if (!curriculum) return;
    const item = kkmData[subjectId] || { nilai: 75, deskripsi: "" };
    try {
      const res = await fetch("/api/grades/kkm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumId: curriculum.id,
          subjectId,
          nilaiKKM: item.nilai,
          deskripsiKKTP: item.deskripsi,
        }),
      });
      if (res.ok) {
        Swal.fire("Tersimpan", "KKM mapel diset", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalBobot = components.reduce((acc, c) => acc + c.bobot, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kurikulum"
        subtitle="Konfigurasi jenis kurikulum, komponen nilai, dan KKM"
        icon={<BookOpen className="w-5 h-5 text-white" />}
      />

      <Card compact>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Tahun Ajaran</label>
            <select
              className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
            >
              <option value="">-- Pilih Tahun --</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year} {y.isActive && "(Aktif)"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Semester</label>
            <select
              className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </Card>
      ) : curriculum ? (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <Card title="Info Kurikulum">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-slate-500">Tipe Pelaksanaan:</span>
                <span className="font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">{curriculum.type}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-slate-500">Status Kunci (Lock):</span>
                <span className={`font-semibold px-3 py-1 rounded-lg ${curriculum.isLocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {curriculum.isLocked ? "Terkunci" : "Terbuka"}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Komponen Nilai">
            <div className="space-y-4">
              <div className={`p-3 rounded-lg text-sm font-medium flex justify-between ${totalBobot === 100 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                <span>Total Bobot Ideal:</span>
                <span>{totalBobot}% / 100%</span>
              </div>
              <div className="space-y-2">
                {components.length === 0 && <p className="text-xs text-slate-500 italic">Belum ada komponen.</p>}
                {components.map((c) => (
                  <div key={c.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm">
                    <span className="font-semibold text-slate-700">{c.name} ({c.code})</span>
                    <span className="font-bold text-indigo-600">{c.bobot}%</span>
                  </div>
                ))}
              </div>

              {!curriculum.isLocked && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama"
                      className="flex-1 text-sm rounded-lg border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                      value={newComponentName}
                      onChange={(e) => setNewComponentName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Kode"
                      className="w-20 text-sm rounded-lg border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                      value={newComponentCode}
                      onChange={(e) => setNewComponentCode(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Bobot %"
                      className="w-24 text-sm rounded-lg border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                      value={newComponentBobot || ""}
                      onChange={(e) => setNewComponentBobot(Number(e.target.value))}
                    />
                  </div>
                  <button
                    onClick={addComponent}
                    className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold rounded-lg text-sm transition-colors"
                  >
                    + Tambah Komponen
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card title="Pengaturan KKM & KKTP Mapel" className="md:col-span-2" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-700">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl w-1/3">Mata Pelajaran</th>
                    <th className="px-4 py-3 font-semibold w-32">Angka KKM</th>
                    <th className="px-4 py-3 font-semibold">Deskripsi KKTP (KurMer)</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub) => {
                    const d = kkmData[sub.id] || { nilai: 75, deskripsi: "" };
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {sub.name} <span className="text-xs ml-1 text-slate-400">({sub.code})</span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0} max={100}
                            className="w-20 border-slate-200 rounded-lg text-sm px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                            value={d.nilai}
                            onChange={(e) => setKkmData({ ...kkmData, [sub.id]: { ...d, nilai: Number(e.target.value) } })}
                            disabled={curriculum.isLocked}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="Peserta didik mampu..."
                            className="w-full border-slate-200 rounded-lg text-sm px-2 py-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                            value={d.deskripsi}
                            onChange={(e) => setKkmData({ ...kkmData, [sub.id]: { ...d, deskripsi: e.target.value } })}
                            disabled={curriculum.isLocked || curriculum.type !== "KURMER"}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => saveKkm(sub.id)}
                            disabled={curriculum.isLocked}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                              curriculum.isLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                            }`}
                          >
                            Simpan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tidak ada kurikulum diset</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto text-center">Tahun ajaran {selectedYearId} semester {semester} belum dikonfigurasi. Pilih kurikulum yang akan dipakai untuk membuat data.</p>
          </div>
          <div className="flex flex-col sm:flex-row max-w-sm mx-auto gap-3 pt-4">
            <select
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            >
              <option value="KURMER">Kurikulum Merdeka</option>
              <option value="K13">Kurikulum 2013</option>
              <option value="KTSP">KTSP</option>
            </select>
            <button
              onClick={createCurriculum}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all text-sm"
            >
              Buat Kurikulum
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
