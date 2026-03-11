export type CurriculumType = "K13" | "KURMER" | "KTSP";

// Fungsi untuk menghitung predikat
export function hitungPredikat(nilai: number, curriculumType: CurriculumType): string {
  if (curriculumType === "KURMER") {
    if (nilai >= 90) return "Sangat Baik";
    if (nilai >= 80) return "Baik";
    if (nilai >= 70) return "Cukup";
    return "Kurang";
  } else if (curriculumType === "K13") {
    if (nilai >= 90) return "A";
    if (nilai >= 80) return "B";
    if (nilai >= 70) return "C";
    return "D";
  } else {
    // KTSP
    if (nilai >= 90) return "A";
    if (nilai >= 80) return "B";
    if (nilai >= 70) return "C";
    return "D";
  }
}

// Komponen Nilai (Format JSON dari Formula)
export interface FormatFormula {
  kode: string;  // Contoh: 'PH', 'PTS', 'PAS'
  bobot: number; // Persentase bobot
}

export interface NilaiKomponen {
  kode: string;
  nilai: number;
}

// Fungsi menghitung nilai akhir berdasarkan bobot komponen
export function hitungNilaiAkhir(
  nilaiKomponen: NilaiKomponen[],
  formula: FormatFormula[]
): number {
  let totalBobot = 0;
  let totalSkor = 0;

  formula.forEach((f) => {
    const komponen = nilaiKomponen.find((n) => n.kode === f.kode);
    const nilai = komponen ? komponen.nilai : 0;
    
    totalSkor += (nilai * f.bobot) / 100;
    totalBobot += f.bobot;
  });

  // Jika total bobot tidak 100, kita kembalikan total skor proporsional terhadap bobot yang ada
  // Namun idealnya formula sudah 100%
  if (totalBobot > 0 && totalBobot !== 100) {
    return Math.round((totalSkor / (totalBobot / 100)) * 100) / 100;
  }

  return Math.round(totalSkor * 100) / 100;
}

// Fungsi generate narasi deskripsi otomatis berdasarkan nilai dan predikat
export function generateDeskripsi(
  namaSiswa: string,
  mapel: string,
  nilai: number,
  predikat: string,
  curriculumType: CurriculumType
): string {
  let narasi = "";

  if (curriculumType === "KURMER") {
    if (predikat === "Sangat Baik") {
      narasi = `Ananda ${namaSiswa} menunjukkan pemahaman yang sangat baik dalam materi ${mapel}, mampu menganalisis permasalahan dengan kritis dan menyajikannya secara tepat.`;
    } else if (predikat === "Baik") {
      narasi = `Ananda ${namaSiswa} menunjukkan pemahaman yang baik dalam materi ${mapel}, dapat menyelesaikan tugas dengan baik.`;
    } else if (predikat === "Cukup") {
      narasi = `Ananda ${namaSiswa} menunjukkan pemahaman yang cukup dalam materi ${mapel}, namun perlu bimbingan lebih lanjut untuk meningkatkan ketelitian.`;
    } else {
      narasi = `Ananda ${namaSiswa} masih perlu banyak bimbingan dalam memahami konsep dasar materi ${mapel}.`;
    }
  } else {
    // K13 / KTSP
    if (predikat === "A") {
      narasi = `Sangat baik dalam memahami materi ${mapel}. Memiliki capaian kompetensi dasar yang sangat memuaskan.`;
    } else if (predikat === "B") {
      narasi = `Baik dalam memahami materi ${mapel}. Capaian kompetensi dasar sudah memenuhi standar.`;
    } else if (predikat === "C") {
      narasi = `Cukup memahami materi ${mapel}. Perlu ditingkatkan kembali penguasaan kompetensi dasar.`;
    } else {
      narasi = `Kurang memahami materi ${mapel}. Sangat membutuhkan bimbingan intensif dalam menguasai kompetensi dasar.`;
    }
  }

  return narasi;
}
