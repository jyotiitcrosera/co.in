function escapeCsvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildReportCsv(rows: unknown[][], sheetName: string, headers: string[] = []) {
  const title = `JYOTI ITC Report - ${sheetName}`;
  const headerRow = headers.length ? [headers.map(escapeCsvCell).join(",")] : [];
  return [title, ...headerRow, ...rows.map((row) => row.map(escapeCsvCell).join(","))].join("\n");
}

export function escapeReportHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildReportPrintBody(rows: unknown[][], sheetName: string, headers: string[] = [], metadata: Record<string, string> = {}) {
  if (!rows.length) return `<p class="empty">No rows match the selected filters.</p>`;
  const headerCells = headers.length ? `<thead><tr>${headers.map((header) => `<th>${escapeReportHtml(header)}</th>`).join("")}</tr></thead>` : "";
  const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeReportHtml(cell)}</td>`).join("")}</tr>`).join("");
  const metadataCells = Object.entries({ "Record type": sheetName, ...metadata, Rows: String(rows.length) }).map(([label, value]) => `<span><b>${escapeReportHtml(label)}:</b> ${escapeReportHtml(value)}</span>`).join("");
  return `<div class="report-meta">${metadataCells}</div><table>${headerCells}<tbody>${tableRows}</tbody></table>`;
}
