/**
 * Utilitas Export CSV — client-side
 * Membuat file CSV dari data dan men-trigger download di browser.
 */
export function exportCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const csvContent = [
    headers.join(","),
    ...rows.map(row =>
      row.map(cell => {
        const str = String(cell ?? "");
        // Escape koma dan kutip
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(",")
    )
  ].join("\n");

  // BOM untuk Excel agar bisa baca UTF-8
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
