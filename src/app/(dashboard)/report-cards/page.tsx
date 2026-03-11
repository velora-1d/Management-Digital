"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { generateReportCardPDF } from "@/lib/report-card-template";

interface Classroom { id: number; name: string; }
interface Curriculum { id: number; type: string; semester: string; academicYear?: { year: string }; }
interface Student { id: number; name: string; nisn: string; nis: string; }
interface FinalGradeCheck { subjectName: string; isLocked: boolean; }
interface ReportCard { id: number; studentId: number; status: string; student: Student; }
interface NoteItem { studentId: number; studentName: string; note: string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReportGenerateResult = any;

const steps = [
  { id: 1, label: "Cek Kelengkapan", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: 2, label: "Catatan Wali Kelas", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { id: 3, label: "Generate & Download", icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

export default function ReportCardsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ganjil");

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
      const res = await fetch(`/api/students?classroomId=${selectedClassroom}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);

      if (selectedCurriculum) {
        const cardsRes = await fetch(`/api/report-cards?classroomId=${selectedClassroom}&curriculumId=${selectedCurriculum}&semester=${selectedSemester}`);
        const cardsData = await cardsRes.json();
        setReportCards(Array.isArray(cardsData) ? cardsData : []);
      }
    } catch { /* ignore */ }
  }, [selectedClassroom, selectedCurriculum, selectedSemester]);

  useEffect(() => { fetchStudentsAndCards(); }, [fetchStudentsAndCards]);

  // Step 1: Cek kelengkapan nilai
  const handleCheckCompleteness = async () => {
    if (!selectedClassroom || !selectedCurriculum) {
      Swal.fire("Peringatan", "Pilih kelas dan kurikulum terlebih dahulu", "warning");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-heading tracking-tight">Rapor Digital (E-Rapor)</h1>
          <p className="text-sm text-slate-500 mt-1">Generate dan kelola rapor semester peserta didik</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                </svg>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kelas</label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">— Pilih Kelas —</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kurikulum</label>
            <select
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">— Pilih Kurikulum —</option>
              {curriculums.map(c => <option key={c.id} value={c.id}>{c.type} — {c.semester} {c.academicYear?.year || ""}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <h2 className="font-heading font-bold text-sm text-slate-800">Cek Kelengkapan Nilai</h2>
            </div>
            <button
              onClick={handleCheckCompleteness}
              disabled={loadingCheck || !selectedClassroom || !selectedCurriculum}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingCheck && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              Periksa Kelengkapan
            </button>
          </div>

          {!selectedClassroom || !selectedCurriculum ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-slate-500 mt-2">Pilih kelas dan kurikulum untuk memeriksa kelengkapan</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">Tidak ada siswa di kelas ini</div>
          ) : (
            <div className="space-y-2">
              {students.map(st => {
                const pct = getCompletionPercent(st.id);
                const status = getStudentStatus(st.id);
                const checks = completionData[st.id] || [];
                return (
                  <div key={st.id} className="border border-slate-100 rounded-xl p-3 hover:border-indigo-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          pct === 100 ? "bg-emerald-100 text-emerald-700" : pct > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {pct}%
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{st.name}</p>
                          <p className="text-xs text-slate-400">NISN: {st.nisn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                          status === "GENERATED" ? "bg-blue-100 text-blue-700" :
                          status === "DRAFT" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {status === "NONE" ? "Belum Dibuat" : status}
                        </span>
                        {pct === 100 ? (
                          <span className="text-emerald-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </span>
                        ) : (
                          <span className="text-amber-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-amber-400" : "bg-slate-300"}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    {checks.length > 0 && pct < 100 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {checks.filter(c => !c.isLocked).map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] rounded border border-rose-100">{c.subjectName}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <h2 className="font-heading font-bold text-sm text-slate-800">Catatan Wali Kelas</h2>
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes || notes.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingNotes && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
              Simpan Semua Catatan
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <p className="text-sm text-slate-500">Pilih kelas terlebih dahulu untuk memuat daftar siswa</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((item, idx) => (
                <div key={item.studentId} className="border border-slate-100 rounded-xl p-3 hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600">{idx + 1}</div>
                    <p className="font-semibold text-sm text-slate-800">{item.studentName}</p>
                  </div>
                  <textarea
                    value={item.note}
                    onChange={(e) => {
                      const updated = [...notes];
                      updated[idx] = { ...updated[idx], note: e.target.value };
                      setNotes(updated);
                    }}
                    placeholder="Tulis catatan wali kelas untuk siswa ini..."
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <h2 className="font-heading font-bold text-sm text-slate-800">Generate & Download Rapor</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedClassroom || !selectedCurriculum}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Generate Data
              </button>
              {generatedData?.students?.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Semua PDF
                </button>
              )}
            </div>
          </div>

          {!generatedData ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-slate-500 mt-2">Klik &quot;Generate Data&quot; untuk memproses data rapor</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{generatedData.students?.length || 0}</p>
                  <p className="text-xs text-indigo-500">Total Siswa</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{generatedData.classroom?.name || "-"}</p>
                  <p className="text-xs text-emerald-500">Kelas</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{generatedData.curriculum?.type || "-"}</p>
                  <p className="text-xs text-amber-500">Kurikulum</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-sky-700">{generatedData.curriculum?.semester === "ganjil" ? "Ganjil" : "Genap"}</p>
                  <p className="text-xs text-sky-500">Semester</p>
                </div>
              </div>

              {generatedData.students?.map((sd: ReportGenerateResult, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-3 hover:border-indigo-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{idx + 1}</div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{sd.student.name}</p>
                      <p className="text-xs text-slate-400">{sd.finalGrades?.length || 0} mapel · Alpha: {sd.attendanceSummary?.alpha || 0}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(idx)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-indigo-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Sebelumnya
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
          disabled={currentStep === 3}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Selanjutnya →
        </button>
      </div>
    </div>
  );
}
