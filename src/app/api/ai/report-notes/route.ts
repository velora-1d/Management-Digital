import { NextRequest, NextResponse } from "next/server";

const SUMOPOD_AI_KEY = process.env.SUMOPOD_AI_KEY;
const SUMOPOD_AI_BASE_URL = process.env.SUMOPOD_AI_BASE_URL || "https://ai.sumopod.com/v1";
interface GradeData {
  subjectName: string;
  nilaiAkhir: number;
}

// Fallback logic (Old Smart Engine)
function generateFallbackNote(studentName: string, grades: GradeData[], attendance: { sakit?: number; izin?: number; alpha?: number }) {
  const sortedGrades = [...grades].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
  const topSubject = sortedGrades[0];
  const lowSubject = sortedGrades[sortedGrades.length - 1];
  const average = grades.reduce((acc: number, curr: GradeData) => acc + curr.nilaiAkhir, 0) / grades.length;
  const totalAbsence = (attendance?.sakit || 0) + (attendance?.izin || 0) + (attendance?.alpha || 0);

  let opening = "";
  if (average >= 90) {
    opening = `Ananda ${studentName} menunjukkan prestasi akademik yang sangat luar biasa pada semester ini.`;
  } else if (average >= 80) {
    opening = `Selamat kepada ${studentName} atas pencapaian hasil belajar yang baik dan konsisten.`;
  } else if (average >= 70) {
    opening = `${studentName} telah menuntaskan pembelajaran semester ini dengan hasil yang cukup memuaskan.`;
  } else {
    opening = `${studentName} perlu meningkatkan semangat belajar agar mencapai hasil yang lebih optimal di semester depan.`;
  }

  const strength = `Sangat menonjol pada mata pelajaran ${topSubject?.subjectName || "Utama"} dengan penguasaan materi yang baik.`;
  const weakness = average < 85 ? `Perlu perhatian lebih pada ${lowSubject?.subjectName || "beberapa materi"} untuk memperkuat pemahaman dasar.` : "Pertahankan performa di seluruh mata pelajaran.";

  let closing = "";
  if ((attendance?.alpha ?? 0) > 3) {
    closing = "Namun, kepatuhan kehadiran perlu diperhatikan agar tidak menghambat proses belajar.";
  } else if (totalAbsence === 0) {
    closing = "Kedisiplinan kehadiran yang sempurna ini patut dipertahankan.";
  } else {
    closing = "Teruslah semangat dalam belajar dan tingkatkan terus prestasimu.";
  }

  return `${opening} ${strength} ${weakness} ${closing}`;
}

export async function POST(req: NextRequest) {
  try {
    const { studentName, grades, attendance } = await req.json();

    if (!studentName || !grades || !Array.isArray(grades)) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Jika tidak ada API Key, langsung pakai fallback
    if (!SUMOPOD_AI_KEY) {
      console.warn("SUMOPOD_AI_KEY not found, using fallback logic.");
      return NextResponse.json({ note: generateFallbackNote(studentName, grades, attendance) });
    }

    try {
      const sortedGrades = [...grades].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
      const topSubjects = sortedGrades.slice(0, 2).map(g => g.subjectName).join(", ");
      const lowSubjects = sortedGrades.slice(-1).map(g => g.subjectName).join(", ");
      const average = Math.round(grades.reduce((acc: number, curr: GradeData) => acc + (curr.nilaiAkhir || 0), 0) / grades.length);

      const systemPrompt = `Kamu adalah seorang guru wali kelas profesional di Indonesia yang ramah, bijaksana, dan memotivasi. 
Tugasmu adalah menyusun "Catatan Wali Kelas" untuk rapor siswa.
Gunakan Bahasa Indonesia yang formal namun hangat (menggunakan sapaan 'Ananda' atau nama siswa).
Fokus pada apresiasi prestasi, dorongan motivasi, dan saran perbaikan yang konstruktif.`;

      const userPrompt = `Nama Siswa: ${studentName}
Rata-rata Nilai: ${average}
Mata Pelajaran Unggulan: ${topSubjects}
Mata Pelajaran Perlu Perbaikan: ${lowSubjects}
Kehadiran: Sakit (${attendance?.sakit || 0}), Izin (${attendance?.izin || 0}), Tanpa Keterangan (${attendance?.alpha || 0}).

Buatlah narasi catatan wali kelas sebanyak 2-3 kalimat yang personal dan memovivasi berdasarkan data di atas.`;

      const response = await fetch(`${SUMOPOD_AI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUMOPOD_AI_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-v3", // Model default (bisa diganti sesuai kebutuhan)
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`AI API responded with status ${response.status}`);
      }

      const aiData = await response.json();
      const generatedNote = aiData.choices?.[0]?.message?.content?.trim();

      if (!generatedNote) {
        throw new Error("AI returned empty content");
      }

      return NextResponse.json({ note: generatedNote });

    } catch (aiError) {
      console.error("AI Generation Error, falling back:", aiError);
      return NextResponse.json({ note: generateFallbackNote(studentName, grades, attendance) });
    }

  } catch (error) {
    console.error("Main API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
