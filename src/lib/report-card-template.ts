import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

interface GradeData {
  subjectName: string;
  subjectCode: string;
  subjectType: string;
  nilaiPengetahuan: number;
  nilaiKeterampilan: number;
  nilaiAkhir: number;
  predikat: string;
  deskripsi: string;
}

interface ExtraData {
  name: string;
  score: number;
  predicate: string;
}

interface StudentReportData {
  student: {
    id?: number;
    name: string;
    nisn: string;
    nis: string;
    gender: string;
    birthPlace: string;
    birthDate: string;
    address: string;
  };
  finalGrades: GradeData[];
  attendanceSummary: { sakit: number; izin: number; alpha: number };
  extracurriculars: ExtraData[];
  teacherNote: string;
}

interface ReportConfig {
  school: Record<string, string>;
  curriculum: { type: string; semester: string; academicYear: string };
  classroom: { name: string; waliKelas: string };
  signatures?: {
    headmaster?: string;
    homeroom?: string;
  };
  isDraft?: boolean;
  verificationUrl?: string;
}

type JsPdfWithPlugins = jsPDF & {
  GState: new (options: { opacity: number }) => unknown;
  lastAutoTable?: { finalY: number };
};

function getAutoTableFinalY(doc: jsPDF): number {
  return (doc as JsPdfWithPlugins).lastAutoTable?.finalY ?? 0;
}

export async function generateReportCardPDF(
  studentData: StudentReportData,
  config: ReportConfig
): Promise<jsPDF> {
  const doc = new jsPDF("p", "mm", "a4");
  const docWithPlugins = doc as JsPdfWithPlugins;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Watermark "DRAFT"
  if (config.isDraft) {
    doc.saveGraphicsState();
    doc.setGState(new docWithPlugins.GState({ opacity: 0.1 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(80);
    doc.setTextColor(255, 0, 0); // Red color for visibility
    doc.text("DRAFT", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45
    });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0); // Reset text color
  }

  const schoolName = config.school["school_name"] || config.school["nama_sekolah"] || "Sekolah";
  const schoolAddress = config.school["school_address"] || config.school["alamat_sekolah"] || "";
  const schoolNpsn = config.school["npsn"] || "";

  const reportLogo = config.school["report_logo"] || config.school["school_logo"] || "";
  const logoPosition = config.school["report_logo_position"] || "left";
  const logoSizeStr = config.school["report_logo_size"] || "medium";
  
  let logoSize = 20;
  if (logoSizeStr === "small") logoSize = 15;
  if (logoSizeStr === "large") logoSize = 25;

  // === HEADER / KOP ===
  if (reportLogo && logoPosition === "center") {
    if (reportLogo.startsWith("data:image/")) {
      try {
        doc.addImage(reportLogo, "JPEG", pageWidth / 2 - (logoSize / 2), y, logoSize, logoSize);
        y += logoSize + 5;
      } catch (e) {
        console.error("Error adding center logo", e);
      }
    }
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN HASIL BELAJAR PESERTA DIDIK", pageWidth / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(11);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  if (schoolAddress) {
    doc.text(schoolAddress, pageWidth / 2, y, { align: "center" });
    y += 4;
  }
  if (schoolNpsn) {
    doc.text(`NPSN: ${schoolNpsn}`, pageWidth / 2, y, { align: "center" });
    y += 4;
  }

  if (reportLogo && logoPosition === "left") {
    if (reportLogo.startsWith("data:image/")) {
      try {
        // Position it nicely aligned with the text block
        doc.addImage(reportLogo, "JPEG", margin + 5, margin, logoSize, logoSize);
      } catch (e) {
        console.error("Error adding left logo", e);
      }
    }
  }

  // Garis
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 2;
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // === IDENTITAS SISWA ===
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("IDENTITAS PESERTA DIDIK", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const { student } = studentData;
  const identityRows = [
    ["Nama Peserta Didik", student.name],
    ["NISN", student.nisn],
    ["NIS", student.nis],
    ["Jenis Kelamin", student.gender === "L" ? "Laki-laki" : "Perempuan"],
    ["Tempat, Tanggal Lahir", `${student.birthPlace}, ${student.birthDate}`],
    ["Kelas", config.classroom.name],
    ["Semester", config.curriculum.semester === "ganjil" ? "Ganjil" : "Genap"],
    ["Tahun Pelajaran", config.curriculum.academicYear],
    ["Kurikulum", config.curriculum.type],
  ];

  identityRows.forEach((row) => {
    doc.text(`${row[0]}`, margin, y);
    doc.text(`:  ${row[1]}`, margin + 50, y);
    y += 5;
  });

  y += 5;

  // === TABEL NILAI ===
  doc.setFont("helvetica", "bold");
  doc.text("CAPAIAN HASIL BELAJAR", margin, y);
  y += 3;

  const gradeHeaders = ["No", "Mata Pelajaran", "Pengetahuan", "Keterampilan", "Nilai Akhir", "Predikat"];
  const gradeRows = studentData.finalGrades.map((g, i) => [
    String(i + 1),
    g.subjectName,
    g.nilaiPengetahuan > 0 ? String(g.nilaiPengetahuan) : "-",
    g.nilaiKeterampilan > 0 ? String(g.nilaiKeterampilan) : "-",
    String(g.nilaiAkhir),
    g.predikat,
  ]);

  autoTable(doc, {
    startY: y,
    head: [gradeHeaders],
    body: gradeRows.length > 0 ? gradeRows : [["", "Belum ada data nilai", "", "", "", ""]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 18, halign: "center" },
    },
    theme: "grid",
  });

  y = getAutoTableFinalY(doc) + 8;

  // Cek apakah cukup ruang, jika tidak pindah halaman
  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  // === DESKRIPSI CAPAIAN ===
  if (studentData.finalGrades.some((g) => g.deskripsi)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DESKRIPSI CAPAIAN KOMPETENSI", margin, y);
    y += 3;

    const descRows = studentData.finalGrades
      .filter((g) => g.deskripsi)
      .map((g, i) => [String(i + 1), g.subjectName, g.deskripsi]);

    autoTable(doc, {
      startY: y,
      head: [["No", "Mata Pelajaran", "Deskripsi"]],
      body: descRows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 35 },
      },
      theme: "grid",
    });

    y = getAutoTableFinalY(doc) + 8;
  }

  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  // === EKSTRAKURIKULER ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("KEGIATAN EKSTRAKURIKULER", margin, y);
  y += 3;

  const extraRows = studentData.extracurriculars.length > 0
    ? studentData.extracurriculars.map((e, i) => [String(i + 1), e.name, e.predicate || "-"])
    : [["", "Tidak mengikuti kegiatan ekstrakurikuler", ""]];

  autoTable(doc, {
    startY: y,
    head: [["No", "Kegiatan", "Predikat"]],
    body: extraRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
    },
    theme: "grid",
  });

  y = getAutoTableFinalY(doc) + 8;

  // === KETIDAKHADIRAN ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("KETIDAKHADIRAN", margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [["Keterangan", "Jumlah Hari"]],
    body: [
      ["Sakit", String(studentData.attendanceSummary.sakit)],
      ["Izin", String(studentData.attendanceSummary.izin)],
      ["Tanpa Keterangan (Alpha)", String(studentData.attendanceSummary.alpha)],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { cellWidth: 30, halign: "center" } },
    theme: "grid",
    tableWidth: contentWidth * 0.5,
  });

  y = getAutoTableFinalY(doc) + 8;

  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  // === CATATAN WALI KELAS ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CATATAN WALI KELAS", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const noteText = studentData.teacherNote || "Tidak ada catatan.";
  const lines = doc.splitTextToSize(noteText, contentWidth);
  doc.text(lines, margin, y);
  y += lines.length * 4 + 10;

  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  // === TANDA TANGAN ===
  const colWidth = contentWidth / 2;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  // Kolom kiri: mengetahui
  doc.text("Mengetahui,", margin, y);
  doc.text("Kepala Sekolah", margin, y + 5);
  const headmasterSignature = config.signatures?.headmaster || config.school["headmaster_signature"] || "";
  if (headmasterSignature.startsWith("data:image/")) {
    try {
      doc.addImage(headmasterSignature, margin, y + 8, 35, 14);
    } catch {
      // Fallback ke placeholder garis jika format image tidak didukung
    }
  }
  doc.text("_______________________", margin, y + 25);
  doc.text(`NIP. ......................`, margin, y + 30);

  // Kolom kanan: wali kelas
  const rightX = margin + colWidth + 10;
  doc.text(`Wali Kelas ${config.classroom.name}`, rightX, y + 5);
  const homeroomSignature = config.signatures?.homeroom || config.school["homeroom_signature"] || "";
  if (homeroomSignature.startsWith("data:image/")) {
    try {
      doc.addImage(homeroomSignature, rightX, y + 8, 35, 14);
    } catch {
      // Fallback ke placeholder garis jika format image tidak didukung
    }
  }
  doc.text("_______________________", rightX, y + 25);
  doc.text(config.classroom.waliKelas || "Nama Wali Kelas", rightX, y + 30);

  // === QR CODE & VERIFIKASI (Phase 1) ===
  const bottomY = pageHeight - 30;
  if (config.verificationUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(config.verificationUrl, { margin: 1, width: 100 });
      doc.addImage(qrDataUrl, "PNG", margin, bottomY, 15, 15);
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text("Dokumen ini diterbitkan secara elektronik dan diverifikasi secara digital.", margin + 17, bottomY + 6);
      doc.text(`Scan QR Code untuk memverifikasi keaslian dokumen. ID: ${studentData.student.id || "N/A"}-${Date.now()}`, margin + 17, bottomY + 9);
      doc.setTextColor(0, 0, 0);
    } catch (e) {
      console.error("Error generating QR code", e);
    }
  }

  return doc;
}

