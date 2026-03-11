"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ============================================================
// TIPE DATA
// ============================================================

export interface ExportColumn {
  header: string;    // Judul kolom yang ditampilkan
  key: string;       // Key dari object data
  width?: number;    // Lebar kolom (untuk PDF, dalam satuan mm)
  align?: "left" | "center" | "right";
  format?: (value: any, row: any) => string; // Custom format
}

export interface ExportOptions {
  title: string;           // Judul laporan
  subtitle?: string;       // Subjudul opsional
  filename: string;        // Nama file tanpa ekstensi
  columns: ExportColumn[];
  data: any[];
  orientation?: "portrait" | "landscape";
  summaryRows?: { label: string; value: string }[]; // Baris ringkasan akhir
}

// ============================================================
// HELPER INTERNAL
// ============================================================

function formatCellValue(col: ExportColumn, row: any): string {
  const val = row[col.key];
  if (col.format) return col.format(val, row);
  if (val === null || val === undefined) return "-";
  if (typeof val === "number") return val.toLocaleString("id-ID");
  return String(val);
}

function getDateStr(): string {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ============================================================
// EXPORT KE PDF
// ============================================================

export function exportToPDF(options: ExportOptions): void {
  const {
    title,
    subtitle,
    filename,
    columns,
    data,
    orientation = "portrait",
    summaryRows,
  } = options;

  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 15, { align: "center" });

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, pageWidth / 2, 22, { align: "center" });
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(`Dicetak: ${getDateStr()}`, pageWidth / 2, subtitle ? 28 : 22, {
    align: "center",
  });
  doc.setTextColor(0);

  // Tabel
  const startY = subtitle ? 33 : 27;
  const head = [columns.map((c) => c.header)];
  const body = data.map((row) => columns.map((col) => formatCellValue(col, row)));

  // Tambah summary rows
  if (summaryRows && summaryRows.length > 0) {
    for (const sr of summaryRows) {
      const summaryRow = columns.map((_, i) => {
        if (i === 0) return sr.label;
        if (i === columns.length - 1) return sr.value;
        return "";
      });
      body.push(summaryRow);
    }
  }

  const colStyles: Record<number, any> = {};
  columns.forEach((col, i) => {
    if (col.align) colStyles[i] = { halign: col.align };
    if (col.width) colStyles[i] = { ...colStyles[i], cellWidth: col.width };
  });

  autoTable(doc, {
    head,
    body,
    startY,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineWidth: 0.1,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: colStyles,
    didParseCell: (data) => {
      // Bold untuk summary rows
      if (summaryRows && data.section === "body") {
        const totalDataRows = options.data.length;
        if (data.row.index >= totalDataRows) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [226, 232, 240];
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}

// ============================================================
// EXPORT KE EXCEL
// ============================================================

export function exportToExcel(options: ExportOptions): void {
  const { title, filename, columns, data, summaryRows } = options;

  // Siapkan data
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((col) => {
    const val = row[col.key];
    if (col.format) return col.format(val, row);
    if (val === null || val === undefined) return "";
    return val;
  }));

  // Tambah summary rows
  if (summaryRows && summaryRows.length > 0) {
    rows.push([]); // Baris kosong
    for (const sr of summaryRows) {
      const summaryRow = columns.map((_, i) => {
        if (i === 0) return sr.label;
        if (i === columns.length - 1) return sr.value;
        return "";
      });
      rows.push(summaryRow);
    }
  }

  // Build worksheet
  const wsData = [
    [title],     // Baris judul
    [],          // Baris kosong
    headers,     // Baris header
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style: merge judul
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];

  // Atur lebar kolom
  ws["!cols"] = columns.map((col) => ({
    wch: col.width ? Math.round(col.width / 2.5) : 15,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ============================================================
// EXPORT KE CSV
// ============================================================

export function exportToCSV(options: ExportOptions): void {
  const { filename, columns, data } = options;

  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = formatCellValue(col, row);
      // Escape double-quote
      return `"${val.replace(/"/g, '""')}"`;
    })
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const BOM = "\uFEFF"; // UTF-8 BOM agar Excel baca benar

  const blob = new Blob([BOM + csv], { type: "text/csv; charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// KOMPONEN TOMBOL EXPORT (REUSABLE)
// ============================================================

export function ExportButtons({
  options,
  size = "sm",
}: {
  options: ExportOptions;
  size?: "sm" | "md";
}) {
  const btnClass =
    size === "sm"
      ? "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5 inline-flex items-center gap-1.5"
      : "px-4 py-2 text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 inline-flex items-center gap-2";

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => exportToPDF(options)}
        className={`${btnClass} bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        PDF
      </button>
      <button
        onClick={() => exportToExcel(options)}
        className={`${btnClass} bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
      <button
        onClick={() => exportToCSV(options)}
        className={`${btnClass} bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        CSV
      </button>
    </div>
  );
}

// ============================================================
// FORMAT HELPER — RUPIAH
// ============================================================

export function fmtRupiah(n: number): string {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}
