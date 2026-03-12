"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { generateReportCardPDF } from "@/lib/report-card-template";
import { 
  CheckCircle, 
  FileText, 
  Download, 
  AlertTriangle, 
  RefreshCw,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import Pagination from "@/components/Pagination";

interface Classroom { id: number; name: string; }
interface Curriculum { id: number; type: string; semester: string; academicYear?: { year: string }; }
interface Student { id: number; name: string; nisn: string; nis: string; }
interface FinalGradeCheck { subjectName: string; isLocked: boolean; }
interface ReportCard { id: number; studentId: number; status: string; student: Student; }
interface NoteItem { studentId: number; studentName: string; note: string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReportGenerateResult = any;

const steps = [
  { id: 1, label: "Cek Kelengkapan", icon: ClipboardList },
  { id: 2, label: "Catatan Wali Kelas", icon: FileText },
  { id: 3, label: "Generate & Download", icon: Download },
];

export default function ReportCardsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ganjil");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // Step 1 state
  const [students, setStudents] = useState<Student[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [completionData, setCompletionData] = useState<Record<number, FinalGradeCheck[]>>({});
  const [loadingCheck, setLoadingCheck] = useState(false);

  // Step 2 state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);

  // Step 3 state
  const [generatedData, setGeneratedData] = useState<ReportGenerateResult | null>(null);
  const [generating, setGenerating] = useState(false);

  // Fetch metadata
  useEffect(() => {
    fetch("/api/classrooms").then(r => r.json()).then(d => setClassrooms(Array.isArray(d) ? d : []));
    fetch("/api/curriculum").then(r => r.json()).then(d => setCurriculums(Array.isArray(d) ? d : []));
  }, []);

  // Fetch students & report cards ketika filter berubah
  const fetchStudentsAndCards = useCallback(async () => {
    if (!selectedClassroom) return;
    try {
      // Students fetch (dengan paginasi)
      const res = await fetch(`/api/students?classroomId=${selectedClassroom}&page=${page}&limit=${limit}`);
      const stdData = await res.json();
      
      const studentsList = stdData.data || [];
      setStudents(studentsList);
      
      // Update pagination metadata from students API
      if (stdData.pagination) {
        setPagination({
          total: stdData.pagination.total,
          totalPages: stdData.pagination.totalPages
        });
      }

      if (selectedCurriculum) {
        const cardsRes = await fetch(`/api/report-cards?classroomId=${selectedClassroom}&curriculumId=${selectedCurriculum}&semester=${selectedSemester}&page=${page}&limit=${limit}`);
        const cardsData = await cardsRes.json();
        setReportCards(cardsData.data || []);
      }
    } catch { /* ignore */ }
  }, [selectedClassroom, selectedCurriculum, selectedSemester, page, limit]);

  useEffect(() => { fetchStudentsAndCards(); }, [fetchStudentsAndCards]);

  // Step 1: Cek kelengkapan nilai
  const handleCheckCompleteness = async () => {
    if (!selectedClassroom || !selectedCurriculum) {
      Swal.fire("Peringatan", "Pilih kelas dan kurikulum terlebih jauh", "warning");
      return;
    }
    setLoadingCheck(true);
    try {
      // Ambil daftar final grades per siswa
      const res = await fetch(`/api/grades/final?classroomId=${selectedClassroom}&curriculumId=${selectedCurriculum}`);
      const finalGrades = await res.json();

      // Ambil daftar mapel
      const subjectsRes = await fetch("/api/subjects");
      const subjects = await subjectsRes.json();
      const subjectList = Array.isArray(subjects) ? subjects.filter((s: { status: string }) => s.status === "aktif") : [];

      // Build completion per siswa
      const completion: Record<number, FinalGradeCheck[]> = {};
      students.forEach(st => {
        completion[st.id] = subjectList.map((subj: { id: number; name: string }) => {
          const fg = Array.isArray(finalGrades)
            ? finalGrades.find((g: { studentId: number; subjectId: number }) => g.studentId === st.id && g.subjectId === subj.id)
            : null;
          return {
            subjectName: subj.name,
            isLocked: !!fg?.isLocked,
          };
        });
      });
      setCompletionData(completion);

      // Auto-create draft report cards
      await fetch("/api/report-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: students.map(s => s.id),
          classroomId: selectedClassroom,
          curriculumId: selectedCurriculum,
          semester: selectedSemester,
        }),
      });

      await fetchStudentsAndCards();
    } catch { Swal.fire("Error", "Gagal memeriksa kelengkapan", "error"); }
    setLoadingCheck(false);
  };

  // Step 2: Load & save notes
  const loadNotes = useCallback(async () => {
    if (!selectedClassroom) return;
    try {
      const res = await fetch(`/api/report-cards/notes?classroomId=${selectedClassroom}&semester=${selectedSemester}`);
      const existing = await res.json();
      const existingArr = Array.isArray(existing) ? existing : [];

      const notesList = students.map(st => {
        const found = existingArr.find((n: { studentId: number }) => n.studentId === st.id);
        return { studentId: st.id, studentName: st.name, note: found?.note || "" };
      });
      setNotes(notesList);
    } catch { /* ignore */ }
  }, [selectedClassroom, selectedSemester, students]);

  useEffect(() => { if (currentStep === 2) loadNotes(); }, [currentStep, loadNotes]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch("/api/report-cards/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes.map(n => ({ studentId: n.studentId, note: n.note })),
          classroomId: selectedClassroom,
          semester: selectedSemester,
        }),
      });
      Swal.fire("Berhasil", "Catatan wali kelas tersimpan", "success");
    } catch { Swal.fire("Error", "Gagal menyimpan catatan", "error"); }
    setSavingNotes(false);
  };

  // Step 3: Generate
  const handleGenerate = async () => {
    if (!selectedClassroom || !selectedCurriculum) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/report-cards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: students.map(s => s.id),
          classroomId: selectedClassroom,
          curriculumId: selectedCurriculum,
          semester: selectedSemester,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedData(data);
      Swal.fire("Berhasil", `Data rapor ${data.students?.length || 0} siswa berhasil di-generate`, "success");
    } catch (e: unknown) {
      Swal.fire("Error", e instanceof Error ? e.message : "Gagal generate rapor", "error");
    }
    setGenerating(false);
  };

  const handleDownloadPDF = (studentIndex: number) => {
    if (!generatedData?.students?.[studentIndex]) return;
    const studentData = generatedData.students[studentIndex];
    const config = {
      school: generatedData.school,
      curriculum: generatedData.curriculum,
      classroom: generatedData.classroom,
    };
    const doc = generateReportCardPDF(studentData, config);
    doc.save(`Rapor_${studentData.student.name.replace(/\s+/g, "_")}.pdf`);
  };

  const handleDownloadAll = () => {
    if (!generatedData?.students?.length) return;
    generatedData.students.forEach((_: ReportGenerateResult, i: number) => {
      setTimeout(() => handleDownloadPDF(i), i * 500);
    });
  };

  const getStudentStatus = (studentId: number) => {
    const card = reportCards.find(rc => rc.studentId === studentId);
    return card?.status || "NONE";
  };

  const getCompletionPercent = (studentId: number) => {
    const checks = completionData[studentId];
    if (!checks?.length) return 0;
    const locked = checks.filter(c => c.isLocked).length;
    return Math.round((locked / checks.length) * 100);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapor Digital (E-Rapor)"
        subtitle="Generate dan kelola rapor semester peserta didik"
        icon={<FileText className="w-5 h-5 text-indigo-600" />}
      />

      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
             const StepIcon = step.icon;
             return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentStep === step.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : currentStep > step.id
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card compact>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Kelas</label>
            <select
              value={selectedClassroom}
              onChange={(e) => { setSelectedClassroom(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:border-slate-300 transition-colors"
            >
              <option value="">— Pilih Kelas —</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Kurikulum</label>
            <select
              value={selectedCurriculum}
              onChange={(e) => { setSelectedCurriculum(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:border-slate-300 transition-colors"
            >
              <option value="">— Pilih Kurikulum —</option>
              {curriculums.map(c => <option key={c.id} value={c.id}>{c.type} — {c.semester} {c.academicYear?.year || ""}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => { setSelectedSemester(e.target.value); setPage(1); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none hover:border-slate-300 transition-colors"
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <Card
        title={steps.find(s => s.id === currentStep)?.label}
        icon={steps.find(s => s.id === currentStep)?.icon && (() => {
          const Icon = steps.find(s => s.id === currentStep)!.icon;
          return <Icon className="w-5 h-5 text-indigo-600" />;
        })()}
        actions={
          currentStep === 1 ? (
             <button
              onClick={handleCheckCompleteness}
              disabled={loadingCheck || !selectedClassroom || !selectedCurriculum}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingCheck ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
              Periksa Kelengkapan
            </button>
          ) : currentStep === 2 ? (
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes || notes.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingNotes ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Simpan Semua Catatan
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedClassroom || !selectedCurriculum}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Generate Data
              </button>
              {generatedData?.students?.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Semua PDF
                </button>
              )}
            </div>
          )
        }
      >
        {(currentStep === 1 || currentStep === 2) && (
          <div className="space-y-4">
            {!selectedClassroom || !selectedCurriculum ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
                <Info className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Pilih kelas dan kurikulum untuk melanjutkan</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">Tidak ada siswa di kelas ini</div>
            ) : (
              <>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {currentStep === 1 ? (
                    students.map(st => {
                      const pct = getCompletionPercent(st.id);
                      const status = getStudentStatus(st.id);
                      const checks = completionData[st.id] || [];
                      return (
                        <div key={st.id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                                pct === 100 ? "bg-emerald-100 text-emerald-700" : pct > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {pct}%
                              </div>
                              <div>
                                <p className="font-bold text-sm text-slate-800">{st.name}</p>
                                <p className="text-[11px] text-slate-400 font-medium tracking-wide">NISN: {st.nisn} · NIS: {st.nis}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                status === "GENERATED" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                status === "DRAFT" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}>
                                {status === "NONE" ? "BELUM DIPROSES" : status}
                              </span>
                              {pct === 100 ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-slate-300"}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          {checks.length > 0 && pct < 100 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 mr-1 self-center uppercase tracking-tight">Belum Selesai:</span>
                              {checks.filter(c => !c.isLocked).map((c, i) => (
                                <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] rounded font-medium border border-rose-100 shadow-sm">{c.subjectName}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    notes.map((item, idx) => (
                      <div key={item.studentId} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700">{(page-1)*limit + idx + 1}</div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{item.studentName}</p>
                          </div>
                        </div>
                        <textarea
                          value={item.note}
                          onChange={(e) => {
                            const updated = [...notes];
                            updated[idx] = { ...updated[idx], note: e.target.value };
                            setNotes(updated);
                          }}
                          placeholder="Tulis catatan wali kelas untuk siswa ini..."
                          rows={3}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white transition-all hover:border-slate-300 shadow-sm"
                        />
                      </div>
                    ))
                  )}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      page={page}
                      totalPages={pagination.totalPages}
                      total={pagination.total}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {!generatedData ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 px-4">Pastikan kelengkapan nilai & catatan wali kelas sudah sesuai, lalu klik &quot;Generate Data&quot; untuk memproses rapor.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-2xl font-black text-indigo-700">{generatedData.students?.length || 0}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Total Siswa</p>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xl font-bold text-emerald-700 truncate">{generatedData.classroom?.name || "-"}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Kelas</p>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xl font-bold text-amber-700 truncate">{generatedData.curriculum?.type || "-"}</p>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Kurikulum</p>
                  </div>
                  <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xl font-bold text-sky-700">{generatedData.curriculum?.semester === "ganjil" ? "Ganjil" : "Genap"}</p>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mt-1">Semester</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedData.students?.map((sd: ReportGenerateResult, idx: number) => (
                      <div key={idx} className="border border-slate-100 rounded-2xl p-4 hover:border-indigo-100 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-sm font-black text-indigo-700 group-hover:bg-indigo-100 transition-colors shadow-sm">{idx + 1}</div>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{sd.student.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{sd.finalGrades?.length || 0} Mata Pelajaran · {sd.attendanceSummary?.alpha || 0} Alpha</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadPDF(idx)}
                          className="p-2.5 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 shadow-sm group/btn"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Sebelumnya
        </button>
        <div className="flex gap-1.5">
          {steps.map(s => (
            <div key={s.id} className={`w-2.5 h-1.5 rounded-full transition-all ${currentStep === s.id ? "w-8 bg-indigo-600" : "bg-slate-200"}`} />
          ))}
        </div>
        <button
          onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
          disabled={currentStep === 3}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Selanjutnya
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
