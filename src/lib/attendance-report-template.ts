import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface AttendanceReportData {
  classroom: { name: string; level: string };
  academicYear: string;
  startDate: string;
  endDate: string;
  students: {
    name: string;
    nisn: string;
    stats: { hadir: number; sakit: number; izin: number; alpha: number; total: number };
  }[];
  institution: {
    name: string;
    address: string;
    logo?: string;
  };
}

interface AutoTableDocument extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const generateAttendancePDF = async (data: AttendanceReportData) => {
  const doc = new jsPDF();
  const tableDoc = doc as AutoTableDocument;
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();

  // 1. Header (Kop Surat)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(data.institution.name.toUpperCase(), PAGE_WIDTH / 2, 15, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.institution.address, PAGE_WIDTH / 2, 20, { align: "center" });
  doc.line(15, 23, PAGE_WIDTH - 15, 23);

  // 2. Title Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("LAPORAN REKAPITULASI ABSENSI SISWA", PAGE_WIDTH / 2, 32, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Kelas: ${data.classroom.name}`, 15, 40);
  doc.text(`Tahun Ajaran: ${data.academicYear}`, 15, 45);
  doc.text(`Periode: ${data.startDate} s/d ${data.endDate}`, PAGE_WIDTH - 15, 40, { align: "right" });

  // 3. Table Data
  autoTable(doc, {
    startY: 52,
    head: [["No", "NISN", "Nama Lengkap", "H", "S", "I", "A", "Total"]],
    body: data.students.map((s, i) => [
      i + 1,
      s.nisn,
      s.name,
      s.stats.hadir,
      s.stats.sakit,
      s.stats.izin,
      s.stats.alpha,
      s.stats.total
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], halign: "center" },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" }
    },
    styles: { fontSize: 8 }
  });

  // 4. Footer / Signature
  const finalY = (tableDoc.lastAutoTable?.finalY ?? 52) + 15;
  const today = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  
  doc.text(`Dicetak pada: ${today}`, 15, finalY);
  
  doc.text("Mengetahui,", PAGE_WIDTH - 60, finalY);
  doc.text("Wali Kelas,", PAGE_WIDTH - 60, finalY + 5);
  
  doc.setFont("helvetica", "italic");
  doc.text("(.........................................)", PAGE_WIDTH - 60, finalY + 25);

  return doc.output("blob");
};
